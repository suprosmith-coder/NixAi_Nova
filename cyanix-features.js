/* ================================================================
   CYANIX AI - COMPLETE FEATURE SET
   
   Features included:
   1. Complix Thinking Display (DeepSeek-style)
   2. Groq TTS Integration  
   3. Edit & Regenerate Messages
   4. Custom System Instructions
   5. Voice Input (Browser API)
   6. Auto-Generated Titles
   7. Pin Important Chats
   8. Search Chat History
   9. Thumbs Up/Down Feedback
   10. Shareable Read-Only Links
   11. Starter Templates
   12. Continue Generating
================================================================ */

// ============================================================================
// CONFIGURATION
// ============================================================================

const GROQ_API_KEY = 'your-groq-api-key-here'; // Add your Groq API key
const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';
const COMPLIX_MODELS = ['cyanix-maverick', 'cyanix-pro'];

// State
let showThinkingProcess = true;
let currentAudio = null;
let systemInstructions = '';
let isRecording = false;
let recognition = null;

// ============================================================================
// FEATURE 1: COMPLIX THINKING DISPLAY
// ============================================================================

/**
 * Extract and display thinking process from AI response
 * Supports DeepSeek-style <thinking> tags
 */
function handleComplixResponse(response, messageElement, model) {
    if (!COMPLIX_MODELS.includes(model)) {
        return response; // Not a Complix model
    }
    
    // Extract thinking if present
    const thinkingMatch = response.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    
    if (thinkingMatch && showThinkingProcess) {
        const thinking = thinkingMatch[1].trim();
        const answer = response.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim();
        
        // Display thinking process
        displayThinkingProcess(thinking, messageElement);
        
        return answer;
    }
    
    return response;
}

function displayThinkingProcess(thinkingContent, messageElement) {
    const bubble = messageElement.querySelector('.message-bubble');
    const content = bubble.querySelector('.message-content');
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'thinking-process collapsed';
    thinkingDiv.innerHTML = `
        <div class="thinking-header" onclick="toggleThinking(this)">
            <i class="fas fa-brain"></i>
            <span class="thinking-label">Complex Thinking Process</span>
            <span class="thinking-badge">Complix</span>
            <i class="fas fa-chevron-down thinking-chevron"></i>
        </div>
        <div class="thinking-content">
            <div class="thinking-steps">${formatThinkingSteps(thinkingContent)}</div>
        </div>
    `;
    
    bubble.insertBefore(thinkingDiv, content);
}

function formatThinkingSteps(content) {
    // Split into steps if numbered
    const steps = content.split(/\n\d+\.\s+/).filter(s => s.trim());
    
    if (steps.length > 1) {
        return steps.map((step, i) => `
            <div class="thinking-step">
                <div class="step-number">${i + 1}</div>
                <div class="step-content">${step.trim()}</div>
            </div>
        `).join('');
    }
    
    return `<div class="thinking-text">${content}</div>`;
}

function toggleThinking(header) {
    const thinkingDiv = header.parentElement;
    const chevron = header.querySelector('.thinking-chevron');
    
    if (thinkingDiv.classList.contains('collapsed')) {
        thinkingDiv.classList.remove('collapsed');
        chevron.style.transform = 'rotate(180deg)';
    } else {
        thinkingDiv.classList.add('collapsed');
        chevron.style.transform = 'rotate(0deg)';
    }
}

// ============================================================================
// FEATURE 2: GROQ TTS
// ============================================================================

async function speakWithGroq(text, button) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        const cleanText = cleanTextForSpeech(text);
        if (!cleanText) return;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        button.disabled = true;
        
        const response = await fetch(GROQ_TTS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: cleanText.substring(0, 4096), // Limit length
                voice: 'alloy',
                speed: 1.0
            })
        });
        
        if (!response.ok) throw new Error('TTS failed');
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        currentAudio = new Audio(audioUrl);
        
        currentAudio.onplay = () => {
            button.innerHTML = '<i class="fas fa-pause"></i> Pause';
            button.disabled = false;
            button.classList.add('active');
        };
        
        currentAudio.onpause = () => {
            button.innerHTML = '<i class="fas fa-play"></i> Resume';
            button.classList.remove('active');
        };
        
        currentAudio.onended = () => {
            button.innerHTML = '<i class="fas fa-volume-up"></i> Read aloud';
            button.classList.remove('active');
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };
        
        await currentAudio.play();
        
    } catch (error) {
        console.error('Groq TTS error:', error);
        showToast('Failed to generate speech', 'error');
        button.innerHTML = '<i class="fas fa-volume-up"></i> Read aloud';
        button.disabled = false;
    }
}

function cleanTextForSpeech(text) {
    return text
        .replace(/```[\s\S]*?```/g, '[code block]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#+ /g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

// ============================================================================
// FEATURE 3: EDIT & REGENERATE
// ============================================================================

function editMessage(messageElement) {
    const contentDiv = messageElement.querySelector('.message-content');
    const originalText = contentDiv.textContent.trim();
    
    const textarea = document.createElement('textarea');
    textarea.className = 'message-edit-textarea';
    textarea.value = originalText;
    
    const buttonsHTML = `
        <div class="edit-buttons">
            <button class="edit-save-btn" onclick="saveEditedMessage(this, '${originalText.replace(/'/g, "\\'")}')">
                <i class="fas fa-check"></i> Save & Regenerate
            </button>
            <button class="edit-cancel-btn" onclick="cancelEditMessage(this, '${originalText.replace(/'/g, "\\'")}')">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
    
    contentDiv.innerHTML = '';
    contentDiv.appendChild(textarea);
    contentDiv.insertAdjacentHTML('beforeend', buttonsHTML);
    textarea.focus();
}

async function saveEditedMessage(button, originalText) {
    const contentDiv = button.closest('.message-content');
    const textarea = contentDiv.querySelector('textarea');
    const newText = textarea.value.trim();
    
    if (!newText) {
        showToast('Message cannot be empty', 'error');
        return;
    }
    
    contentDiv.innerHTML = formatMessage(newText);
    
    // Remove all messages after this one
    const messageElement = button.closest('.message');
    let nextElement = messageElement.nextElementSibling;
    while (nextElement) {
        const toRemove = nextElement;
        nextElement = nextElement.nextElementSibling;
        toRemove.remove();
    }
    
    // Regenerate
    document.getElementById('chatInput').value = newText;
    await sendMessage();
}

function cancelEditMessage(button, originalText) {
    const contentDiv = button.closest('.message-content');
    contentDiv.innerHTML = formatMessage(originalText);
}

async function regenerateLastResponse() {
    const messages = document.querySelectorAll('.message');
    if (messages.length < 2) return;
    
    let lastUserMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].classList.contains('user')) {
            lastUserMessage = messages[i];
            break;
        }
    }
    
    if (!lastUserMessage) return;
    
    const text = lastUserMessage.querySelector('.message-content').textContent.trim();
    
    // Remove all messages after
    let nextElement = lastUserMessage.nextElementSibling;
    while (nextElement) {
        const toRemove = nextElement;
        nextElement = nextElement.nextElementSibling;
        toRemove.remove();
    }
    
    document.getElementById('chatInput').value = text;
    await sendMessage();
}

// ============================================================================
// FEATURE 4: CUSTOM SYSTEM INSTRUCTIONS
// ============================================================================

function openSystemInstructions() {
    const modal = document.getElementById('systemInstructionsModal');
    if (!modal) return;
    
    const textarea = modal.querySelector('#systemInstructionsText');
    textarea.value = systemInstructions;
    modal.classList.add('active');
}

function saveSystemInstructions() {
    const textarea = document.getElementById('systemInstructionsText');
    systemInstructions = textarea.value.trim();
    
    // Save to localStorage
    localStorage.setItem('cyanix_system_instructions', systemInstructions);
    
    showToast('System instructions saved', 'success');
    closeSystemInstructionsModal();
}

function closeSystemInstructionsModal() {
    const modal = document.getElementById('systemInstructionsModal');
    if (modal) modal.classList.remove('active');
}

// Load on init
function loadSystemInstructions() {
    systemInstructions = localStorage.getItem('cyanix_system_instructions') || '';
}

// ============================================================================
// FEATURE 5: VOICE INPUT
// ============================================================================

function initVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        
        document.getElementById('chatInput').value = transcript;
        updateCharacterCount();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
        showToast('Voice input error', 'error');
    };
    
    recognition.onend = () => {
        stopVoiceInput();
    };
}

function startVoiceInput() {
    if (!recognition) {
        showToast('Voice input not available', 'error');
        return;
    }
    
    isRecording = true;
    const btn = document.getElementById('voiceInputBtn');
    if (btn) {
        btn.classList.add('recording');
        btn.innerHTML = '<i class="fas fa-stop"></i>';
    }
    
    recognition.start();
}

function stopVoiceInput() {
    isRecording = false;
    const btn = document.getElementById('voiceInputBtn');
    if (btn) {
        btn.classList.remove('recording');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
    
    if (recognition) {
        recognition.stop();
    }
}

function toggleVoiceInput() {
    if (isRecording) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

// ============================================================================
// FEATURE 6: AUTO-GENERATED TITLES
// ============================================================================

async function generateChatTitle(firstUserMessage) {
    try {
        // Use a quick API call to generate a 3-4 word title
        const response = await fetch(SUPABASE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a short 3-4 word title for this conversation. Only respond with the title, nothing else.'
                    },
                    {
                        role: 'user',
                        content: firstUserMessage
                    }
                ],
                model: 'cyanix-flash', // Fast model
                max_tokens: 20
            })
        });
        
        const data = await response.json();
        const title = data.choices[0].message.content.trim();
        
        return title || 'New Chat';
        
    } catch (error) {
        console.error('Title generation error:', error);
        return 'New Chat';
    }
}

// ============================================================================
// FEATURE 7: PIN CHATS
// ============================================================================

async function togglePinChat(chatId) {
    try {
        // Get current pin status
        const { data: chat } = await supabaseClient
            .from('chats')
            .select('is_pinned')
            .eq('id', chatId)
            .single();
        
        const newPinStatus = !chat.is_pinned;
        
        // Update
        await supabaseClient
            .from('chats')
            .update({ is_pinned: newPinStatus })
            .eq('id', chatId);
        
        showToast(newPinStatus ? 'Chat pinned' : 'Chat unpinned', 'success');
        
        // Refresh chat list
        await loadChatHistory();
        
    } catch (error) {
        console.error('Pin error:', error);
        showToast('Failed to pin chat', 'error');
    }
}

// ============================================================================
// FEATURE 8: SEARCH HISTORY
// ============================================================================

async function searchChatHistory(query) {
    if (!query.trim()) {
        await loadChatHistory();
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('chats')
            .select('*')
            .eq('user_id', currentUser.id)
            .or(`title.ilike.%${query}%,last_message.ilike.%${query}%`)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        renderChatHistory(data);
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed', 'error');
    }
}

// ============================================================================
// FEATURE 9: THUMBS UP/DOWN FEEDBACK
// ============================================================================

async function giveFeedback(messageId, type) {
    try {
        await supabaseClient
            .from('feedback')
            .insert({
                message_id: messageId,
                user_id: currentUser.id,
                type: type, // 'up' or 'down'
                created_at: new Date().toISOString()
            });
        
        showToast(type === 'up' ? '👍 Thanks!' : '👎 Feedback noted', 'success', 2000);
        
    } catch (error) {
        console.error('Feedback error:', error);
    }
}

// ============================================================================
// FEATURE 10: SHAREABLE LINKS
// ============================================================================

async function generateShareLink(chatId) {
    try {
        // Generate a unique share token
        const shareToken = generateRandomToken();
        
        // Update chat with share token
        await supabaseClient
            .from('chats')
            .update({ share_token: shareToken })
            .eq('id', chatId);
        
        // Create shareable URL
        const shareUrl = `${window.location.origin}/share/${shareToken}`;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        showToast('Share link copied to clipboard!', 'success');
        
        return shareUrl;
        
    } catch (error) {
        console.error('Share link error:', error);
        showToast('Failed to generate share link', 'error');
    }
}

function generateRandomToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ============================================================================
// FEATURE 11: STARTER TEMPLATES
// ============================================================================

const STARTER_TEMPLATES = [
    {
        icon: '💡',
        title: 'Brainstorm Ideas',
        prompt: 'Help me brainstorm ideas for...'
    },
    {
        icon: '📝',
        title: 'Summarize Text',
        prompt: 'Please summarize the following text:\n\n'
    },
    {
        icon: '✉️',
        title: 'Draft Email',
        prompt: 'Help me draft a professional email about...'
    },
    {
        icon: '🔍',
        title: 'Research Topic',
        prompt: 'I need help researching...'
    },
    {
        icon: '📊',
        title: 'Explain Concept',
        prompt: 'Please explain the concept of...'
    },
    {
        icon: '✅',
        title: 'Create Plan',
        prompt: 'Help me create a plan for...'
    }
];

function showStarterTemplates() {
    const container = document.getElementById('starterTemplates');
    if (!container) return;
    
    container.innerHTML = STARTER_TEMPLATES.map(template => `
        <div class="starter-template" onclick="useTemplate('${template.prompt.replace(/'/g, "\\'")}')">
            <div class="template-icon">${template.icon}</div>
            <div class="template-title">${template.title}</div>
        </div>
    `).join('');
}

function useTemplate(prompt) {
    document.getElementById('chatInput').value = prompt;
    document.getElementById('chatInput').focus();
    document.getElementById('starterTemplates').style.display = 'none';
}

// ============================================================================
// FEATURE 12: CONTINUE GENERATING
// ============================================================================

function checkIfTruncated(response) {
    // Check if response seems cut off
    const endsWithIncomplete = /[,;:]$/.test(response.trim());
    const lastSentence = response.split(/[.!?]/).pop().trim();
    const seemsIncomplete = lastSentence.length > 100 || endsWithIncomplete;
    
    return seemsIncomplete;
}

async function continueGenerating(messageElement) {
    const content = messageElement.querySelector('.message-content').textContent;
    
    // Add user message requesting continuation
    addMessage('[Continue]', 'user');
    
    // Prepare context
    const continuePrompt = 'Please continue exactly where you left off.';
    
    // Send with full context
    document.getElementById('chatInput').value = continuePrompt;
    await sendMessage();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeAllFeatures() {
    loadSystemInstructions();
    initVoiceInput();
    showStarterTemplates();
    
    console.log('✅ All Cyanix features initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
}
