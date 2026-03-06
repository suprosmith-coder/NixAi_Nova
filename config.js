/* ================================================================
   CYANIX AI - CORE CONFIGURATION
   
   All API keys, endpoints, and global settings
================================================================ */

// ============================================================================
// API CONFIGURATION
// ============================================================================

const CYANIX_CONFIG = {
    // Supabase
    supabase: {
        url: 'https://tdbgpvscwaysndrloltl.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw',
        functions: {
            chat: '/functions/v1/chat',
            anthropic: '/functions/v1/anthropic-chat',
            rag: '/functions/v1/rag-search',
            history: '/functions/v1/chat-history',
            tutorix: '/functions/v1/tutorix'
        }
    },
    
    // Groq API
    groq: {
        apiKey: 'your-groq-api-key-here',
        baseUrl: 'https://api.groq.com/openai/v1',
        ttsUrl: 'https://api.groq.com/openai/v1/audio/speech'
    },
    
    // Orpheus Web Search API
    orpheus: {
        apiKey: 'your-orpheus-api-key-here',
        baseUrl: 'https://api.canopylabs.com/v1',
        pricing: {
            advancedSearch: 0.008,  // $8 per 1000
            visitWebsite: 0.001,    // $1 per 1000
            browserSearch: 0.005,   // $5 per 1000
            browserOpen: 0.001      // $1 per 1000
        }
    }
};

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

const MODEL_MAP = {
    'cyanix-maverick': 'meta-llama/llama-4-maverick-17b-128e-instruct',  // 128k ctx, Complix
    'cyanix-scout':    'meta-llama/llama-4-scout-17b-16e-instruct',       // 16k ctx, fast
    'cyanix-flash':    'meta-llama/llama-4-scout-17b-16e-instruct',       // Scout alias
    'cyanix-pro':      'meta-llama/llama-4-maverick-17b-128e-instruct',   // Maverick max tokens
    'cyanix-claude':   'claude-sonnet-4-6'                                 // Anthropic
};

const MODEL_MAX_TOKENS = {
    'cyanix-maverick': 2048,
    'cyanix-scout':    1024,
    'cyanix-flash':    512,
    'cyanix-pro':      4096,
    'cyanix-claude':   4096
};

// Models that support Complix thinking display
const COMPLIX_MODELS = ['cyanix-maverick', 'cyanix-pro'];

// Models that use Anthropic endpoint
const ANTHROPIC_MODELS = new Set(['cyanix-claude']);

// ============================================================================
// UI CONFIGURATION
// ============================================================================

const UI_CONFIG = {
    // Chat
    maxMessageLength: 32000,
    autoScroll: true,
    showTimestamps: true,
    
    // Features
    enableVoiceInput: true,
    enableThinkingDisplay: true,
    enableWebSearch: true,
    enableTTS: true,
    
    // Starter templates
    showTemplatesOnNewChat: true,
    
    // Themes
    defaultTheme: 'dark',
    availableThemes: ['dark', 'light', 'cyber']
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    systemInstructions: 'cyanix_system_instructions',
    showThinking: 'cyanix_show_thinking',
    orpheusCosts: 'orpheus_costs',
    userPreferences: 'cyanix_user_prefs',
    theme: 'cyanix_theme'
};

// ============================================================================
// STARTER TEMPLATES
// ============================================================================

const STARTER_TEMPLATES = [
    {
        icon: '💡',
        title: 'Brainstorm Ideas',
        prompt: 'Help me brainstorm ideas for',
        category: 'creative'
    },
    {
        icon: '📝',
        title: 'Summarize Text',
        prompt: 'Please summarize the following text:\n\n',
        category: 'productivity'
    },
    {
        icon: '✉️',
        title: 'Draft Email',
        prompt: 'Help me draft a professional email about',
        category: 'writing'
    },
    {
        icon: '🔍',
        title: 'Research Topic',
        prompt: 'I need to research',
        category: 'research'
    },
    {
        icon: '📊',
        title: 'Explain Concept',
        prompt: 'Please explain the concept of',
        category: 'learning'
    },
    {
        icon: '✅',
        title: 'Create Plan',
        prompt: 'Help me create a detailed plan for',
        category: 'planning'
    },
    {
        icon: '🌐',
        title: 'Web Search',
        prompt: 'Search the web for the latest information about',
        category: 'search'
    },
    {
        icon: '🎯',
        title: 'Problem Solving',
        prompt: 'Help me solve this problem:',
        category: 'problem-solving'
    }
];

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES = {
    authRequired: 'Please sign in to continue',
    networkError: 'Network error. Please check your connection.',
    apiError: 'API error. Please try again.',
    invalidInput: 'Invalid input. Please check and try again.',
    rateLimitExceeded: 'Rate limit exceeded. Please wait and try again.',
    supabaseConnectionFailed: 'Could not connect to database',
    groqTTSFailed: 'Text-to-speech generation failed',
    orpheusSearchFailed: 'Web search failed',
    fileTooLarge: 'File is too large. Maximum size is 10MB.',
    unsupportedFileType: 'Unsupported file type'
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/markdown', 'text/csv',
        'application/json'
    ],
    minPasswordLength: 8,
    maxChatTitleLength: 100
};

// ============================================================================
// RATE LIMITS
// ============================================================================

const RATE_LIMITS = {
    messagesPerMinute: 20,
    searchesPerHour: 50,
    ttsGenerationsPerHour: 30,
    fileUploadsPerHour: 10
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get full Supabase function URL
 */
function getSupabaseUrl(functionName) {
    const base = CYANIX_CONFIG.supabase.url;
    const path = CYANIX_CONFIG.supabase.functions[functionName];
    return `${base}${path}`;
}

/**
 * Check if model supports Complix thinking
 */
function isComplixModel(modelName) {
    return COMPLIX_MODELS.includes(modelName);
}

/**
 * Check if model uses Anthropic endpoint
 */
function isAnthropicModel(modelName) {
    return ANTHROPIC_MODELS.has(modelName);
}

/**
 * Get actual model string for API
 */
function getModelString(modelName) {
    return MODEL_MAP[modelName] || modelName;
}

/**
 * Get max tokens for model
 */
function getMaxTokens(modelName) {
    return MODEL_MAX_TOKENS[modelName] || 2048;
}

/**
 * Validate email
 */
function validateEmail(email) {
    return VALIDATION.email.test(email);
}

/**
 * Validate URL
 */
function validateUrl(url) {
    return VALIDATION.url.test(url);
}

/**
 * Check file size
 */
function validateFileSize(fileSize) {
    return fileSize <= VALIDATION.maxFileSize;
}

/**
 * Check file type
 */
function validateFileType(fileType) {
    return VALIDATION.allowedFileTypes.includes(fileType);
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CYANIX_CONFIG,
        MODEL_MAP,
        MODEL_MAX_TOKENS,
        COMPLIX_MODELS,
        ANTHROPIC_MODELS,
        UI_CONFIG,
        STORAGE_KEYS,
        STARTER_TEMPLATES,
        ERROR_MESSAGES,
        VALIDATION,
        RATE_LIMITS,
        getSupabaseUrl,
        isComplixModel,
        isAnthropicModel,
        getModelString,
        getMaxTokens,
        validateEmail,
        validateUrl,
        validateFileSize,
        validateFileType
    };
}
