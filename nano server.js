const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('✅ Cyanix AI Server is running!');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Groq API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        console.log('📨 Received chat request');
        
        const { messages, model = 'llama3-8b-8192', temperature = 0.7, max_tokens = 1500 } = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'No messages provided' });
        }

        console.log(`🤖 Using model: ${model}`);
        
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: max_tokens,
                top_p: 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds timeout
            }
        );

        console.log('✅ Response received from Groq API');
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Error processing request',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// Test Groq API connection
app.get('/test-groq', async (req, res) => {
    try {
        console.log('🔗 Testing Groq API connection...');
        
        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            }
        });
        
        const models = response.data.data.map(m => m.id);
        console.log('✅ Groq API connected successfully!');
        
        res.json({ 
            success: true,
            message: 'Groq API is accessible',
            models_count: models.length,
            sample_models: models.slice(0, 5)
        });
        
    } catch (error) {
        console.error('❌ Groq API test failed:', error.message);
        res.status(500).json({
            success: false,
            error: 'Cannot connect to Groq API',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✨ ====================================== ✨`);
    console.log(`   ✅ Cyanix AI Server Started Successfully!`);
    console.log(`   📡 Server running on port ${PORT}`);
    console.log(`   🔗 Local: http://localhost:${PORT}`);
    console.log(`\n   📋 Available Endpoints:`);
    console.log(`   • GET  /          - Server status`);
    console.log(`   • GET  /health    - Health check`);
    console.log(`   • GET  /test-groq - Test Groq API connection`);
    console.log(`   • POST /api/chat  - Main chat endpoint`);
    console.log(`\n   ⚠️  Make sure to:`);
    console.log(`   1. Replace YOUR_TERMUX_IP in HTML file`);
    console.log(`   2. Check your Groq API key in .env file`);
    console.log(`✨ ====================================== ✨\n`);
});

// Handle server errors
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});