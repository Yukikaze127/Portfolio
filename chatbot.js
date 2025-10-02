// AI Chatbot JavaScript - UI Interface with OpenAI Integration
class ChatbotUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.apiStatus = document.getElementById('apiStatus');
        this.aiStatus = document.getElementById('aiStatus');
        
        // Backend Configuration (Secure)
        this.backendUrl = 'http://localhost:3001/api/chat'; // Your secure backend
        this.isApiConnected = true;
        this.isTyping = false;
        this.hideWelcomeMessage = false; // Add this flag
        this.messageHistory = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant integrated into a portfolio website. Be friendly, informative, and concise in your responses. The user is interacting with you through a custom chat interface built by Yukikaze, an aspiring frontend developer.'
            }
        ];
        
        this.initializeEventListeners();
        this.initializeUI();
        
        // Debug log
        console.log('ChatbotUI initialized successfully');
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send (Shift+Enter for new line)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButton();
        });
        
        // Initial button state
        this.updateSendButton();
    }
    
    initializeUI() {
        // Hide welcome message after first interaction
        this.hideWelcomeMessage = false;
        
        // Focus on input
        this.chatInput.focus();
        
        // Set initial status
        this.updateConnectionStatus();
    }
    
    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }
    
    updateSendButton() {
        const hasText = this.chatInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
    }
    
    updateConnectionStatus() {
        if (this.isApiConnected) {
            this.apiStatus.style.display = 'none';
            this.aiStatus.innerHTML = '<i class="bi bi-circle-fill"></i> GPT-4o-mini Connected and Ready';
            this.aiStatus.style.color = '#28a745';
        } else {
            this.apiStatus.style.display = 'block';
            this.aiStatus.innerHTML = '<i class="bi bi-circle-fill"></i> Ready to chat (API not connected)';
            this.aiStatus.style.color = '#ffc107';
        }
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Hide welcome message on first interaction
        if (!this.hideWelcomeMessage) {
            const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }
            this.hideWelcomeMessage = true;
        }
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.chatInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButton();
        
        // Save to history
        this.messageHistory.push({ role: 'user', content: message });
        
        // Show typing indicator and get AI response
        this.showTypingIndicator();
        
        // Get real AI response from OpenAI
        this.getAIResponse(message);
    }
    
    addMessage(content, sender) {
        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage && !this.hideWelcomeMessage) {
            welcomeMessage.remove();
            this.hideWelcomeMessage = true;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-bubble message-bubble-user">
                    <div>${this.escapeHtml(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar avatar-user">
                    <i class="bi bi-person-fill"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar avatar-ai">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-bubble message-bubble-ai">
                    <div>${this.formatAIResponse(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Debug log to track message additions
        console.log(`Message added: ${sender} - ${content.substring(0, 50)}...`);
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.updateSendButton();
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.updateSendButton();
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatAIResponse(text) {
        // Basic formatting for AI responses
        return this.escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    // Demo responses for testing (will be replaced with API)
    getDemoResponse(userMessage) {
        const demoResponses = [
            "That's an interesting question! Once the API is connected, I'll be able to provide much more detailed and helpful responses.",
            "I'm currently in demo mode, but I can see your message: '" + userMessage + "'. With a proper AI API, I could give you a real response!",
            "Thanks for testing the interface! This chatbot is ready for API integration. Your message has been received and displayed correctly.",
            "The chat interface is working perfectly! When connected to an AI service like OpenAI's GPT, Google's Gemini, or Claude, I'll be able to have real conversations with you.",
            "I notice you wrote: '" + userMessage + "'. This demonstrates that the message handling is working correctly. Ready for AI integration!",
        ];
        
        // Simulate API delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
            this.addMessage(randomResponse, 'ai');
            this.messageHistory.push({ role: 'assistant', content: randomResponse });
        }, 1000 + Math.random() * 2000); // 1-3 second delay
    }
    
    // Secure Backend API integration
    async getAIResponse(userMessage) {
        try {
            console.log('Sending request to backend:', userMessage);
            
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: this.messageHistory,
                    model: 'gpt-4o-mini'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Backend Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received response from backend:', data);
            
            this.hideTypingIndicator();
            
            if (data.message) {
                // Ensure the message is added properly
                const aiMessage = data.message;
                this.addMessage(aiMessage, 'ai');
                
                // Add AI response to history
                this.messageHistory.push({ role: 'assistant', content: aiMessage });
                console.log('AI message added successfully');
            } else {
                throw new Error('Invalid response format from backend');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Backend API Error:', error);
            
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Cannot connect to AI service. Please make sure the backend server is running.';
            } else if (error.message.includes('429')) {
                errorMessage = 'AI service is currently busy. Please wait a moment and try again.';
            } else if (error.message.includes('503')) {
                errorMessage = 'AI service is temporarily unavailable. Please try again later.';
            } else if (error.message.includes('authentication')) {
                errorMessage = 'Authentication error with AI service. Please contact support.';
            }
            
            this.addMessage(errorMessage, 'ai');
        }
    }
    
    // Method to enable API when ready
    enableAPI(apiKey) {
        this.isApiConnected = true;
        this.apiKey = apiKey;
        this.updateConnectionStatus();
        console.log('API connected successfully!');
    }
    
    // Method to clear chat but keep system message
    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <i class="bi bi-chat-dots"></i>
                <p>Chat cleared! Start a new conversation...</p>
            </div>
            
            <!-- Sample AI message -->
            <div class="message message-ai">
                <div class="message-avatar avatar-ai">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-bubble message-bubble-ai">
                    <div>Hello! I'm your AI assistant powered by GPT-4o-mini. How can I help you today?</div>
                    <div class="message-time">Just now</div>
                </div>
            </div>
        `;
        
        // Reset message history but keep system message
        this.messageHistory = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant integrated into a portfolio website. Be friendly, informative, and concise in your responses. The user is interacting with you through a custom chat interface built by Yukikaze, an aspiring frontend developer.'
            }
        ];
        this.hideWelcomeMessage = false;
    }
    
    // Method to export chat history
    exportChat() {
        const chatData = {
            timestamp: new Date().toISOString(),
            messages: this.messageHistory
        };
        return JSON.stringify(chatData, null, 2);
    }
}

// Global chatbot instance
let chatbot;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    chatbot = new ChatbotUI();
    
    // Add some keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+L to clear chat
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            if (confirm('Clear chat history?')) {
                chatbot.clearChat();
            }
        }
        
        // Ctrl+E to export chat
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            const chatData = chatbot.exportChat();
            console.log('Chat Export:', chatData);
            
            // Could also download as file:
            /*
            const blob = new Blob([chatData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chat-history.json';
            a.click();
            */
        }
    });
});

// Global functions for external use
function clearChat() {
    if (chatbot) chatbot.clearChat();
}

function enableAPI(apiKey) {
    if (chatbot) chatbot.enableAPI(apiKey);
}

function exportChat() {
    if (chatbot) return chatbot.exportChat();
}