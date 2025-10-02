# AI Chatbot Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- Your OpenAI API key

### Setup Steps

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify environment variables**
   - Check that `.env` file exists and contains your API key
   - Make sure the API key is correct

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Test the server**
   Open your browser and go to: http://localhost:3000/api/health
   You should see: `{"status":"OK","message":"AI Chatbot Backend is running"}`

6. **Use your chatbot**
   Open `ai-chatbot.html` in your browser and start chatting!

## 🔧 Configuration

### Environment Variables (.env file)
```
OPENAI_API_KEY=your-api-key-here
PORT=3000
NODE_ENV=development
```

### Frontend Configuration
In `chatbot.js`, the frontend calls your backend at:
```javascript
this.backendUrl = 'http://localhost:3000/api/chat';
```

## 🛡️ Security Features

- ✅ API key hidden on backend
- ✅ CORS protection
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Input validation
- ✅ Error handling
- ✅ Helmet security headers

## 📡 API Endpoints

### Health Check
- **URL:** `GET /api/health`
- **Response:** Server status

### Chat
- **URL:** `POST /api/chat`
- **Body:** 
  ```json
  {
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gpt-4"
  }
  ```

## 🚀 Deployment

### For Production:
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Set up reverse proxy (nginx)
4. Use HTTPS
5. Update CORS origins for your domain

### Example PM2 setup:
```bash
npm install -g pm2
pm2 start server.js --name "ai-chatbot"
pm2 startup
pm2 save
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Cannot connect to AI service"**
   - Make sure the backend server is running on port 3000
   - Check that Node.js is installed

2. **"Authentication error"**
   - Verify your OpenAI API key in `.env` file
   - Make sure the API key is valid

3. **CORS errors**
   - Add your frontend URL to the CORS origins in `server.js`

4. **Port already in use**
   - Change PORT in `.env` file
   - Update frontend `backendUrl` accordingly

## 📊 Monitoring

Check server logs for:
- API request counts
- Error messages
- Performance metrics

## 🎯 Next Steps

1. Add authentication for multiple users
2. Implement conversation persistence
3. Add more AI models (Claude, Gemini)
4. Create admin dashboard
5. Add usage analytics

---

**Your API key is now secure!** 🔐 No one can steal it from your frontend code.