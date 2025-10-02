const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:5500', 
        'http://localhost:5500',
        'https://yukikaze127.github.io', // Add your GitHub Pages URL
        'https://yukikaze127.github.io/Portfolio' // Add your specific repo URL
    ],
    credentials: true
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Validate environment variables
if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is not set!');
    process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'AI Chatbot Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🤖 AI Chatbot Backend',
        status: 'Running',
        endpoints: ['/api/health', '/api/chat']
    });
});

// Chat endpoint - handles OpenAI API calls securely
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'gpt-4' } = req.body;
        
        // Validate request
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request: messages array is required'
            });
        }
        
        // Validate message format
        for (const message of messages) {
            if (!message.role || !message.content) {
                return res.status(400).json({
                    error: 'Invalid message format: role and content are required'
                });
            }
        }
        
        // Limit conversation history length to prevent huge requests
        const maxMessages = 20;
        const limitedMessages = messages.slice(-maxMessages);
        
        console.log(`🤖 Processing chat request with ${limitedMessages.length} messages`);
        
        // Make request to OpenAI API
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: limitedMessages,
                max_tokens: 1000,
                temperature: 0.7,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API Error:', response.status, errorData);
            
            // Handle specific OpenAI errors
            if (response.status === 401) {
                return res.status(500).json({
                    error: 'API authentication failed. Please contact support.'
                });
            } else if (response.status === 429) {
                return res.status(429).json({
                    error: 'AI service is currently busy. Please try again in a moment.'
                });
            } else if (response.status === 500) {
                return res.status(503).json({
                    error: 'AI service is temporarily unavailable. Please try again later.'
                });
            } else {
                return res.status(500).json({
                    error: 'An error occurred while processing your request.'
                });
            }
        }
        
        const data = await response.json();
        
        // Validate OpenAI response
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid OpenAI response:', data);
            return res.status(500).json({
                error: 'Invalid response from AI service'
            });
        }
        
        // Return the AI response
        res.json({
            message: data.choices[0].message.content,
            model: data.model,
            usage: data.usage
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            error: 'Internal server error. Please try again later.'
        });
    }
});

// Catch 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error:', error);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI Chatbot Backend server running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   - Health: http://localhost:${PORT}/api/health`);
    console.log(`   - Chat: http://localhost:${PORT}/api/chat (POST)`);
    console.log(`🔐 OpenAI API Key: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});

module.exports = app;