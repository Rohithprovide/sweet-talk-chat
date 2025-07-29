// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const userInput = document.getElementById('userInput');
const messageForm = document.getElementById('messageForm');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');

// Simplified voice settings
let voiceSettings = {
    pitch: 1.1,
    rate: 0.9,
    volume: 1.0,
    voiceName: null
};

// State
let conversations = { messages: [] };
let isTyping = false;
let isRecording = false;
let speechSynthesis = window.speechSynthesis;
let recognition = null;

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const LOCAL_STORAGE_PREFIX = 'gemini_chat_';
const KEYS = {
    API_KEY: 'api_key',
    THEME: 'theme',
    CHATS: 'chats',
    MODEL: 'model',
    TEXT_TO_SPEECH: 'text_to_speech',
    VOICE_PITCH: 'voice_pitch',
    VOICE_RATE: 'voice_rate',
    VOICE_VOLUME: 'voice_volume',
    VOICE_NAME: 'voice_name'
};

// Emoji data
const emojiData = {
    smileys: ['😍', '🥰', '😘', '😗', '😚', '😙', '🤤', '😋', '😏', '😉', '😊', '🥺', '😌', '🤭', '🤫', '😎', '🤗', '🙂', '😂', '🤣', '😜', '😝', '🤪', '😛', '🥴', '😵‍💫', '🤯', '🥳', '😇', '🤠', '🥸', '🤓', '😈'],
    hearts: ['💋', '💘', '💕', '💖', '💗', '💓', '💞', '💝', '❤️‍🔥', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '♥️', '💔', '❣️', '💟', '💌', '💒', '💐', '🌹', '🌺', '🌸', '🌷', '🥀', '💯', '💫'],
    gestures: ['👋', '🤚', '🖐️', '✋', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'],
    objects: ['🔥', '⭐', '🌟', '💫', '✨', '💎', '👑', '🎀', '🌹', '🥂', '🍾', '🍷', '🍸', '🍹', '🫦', '👄', '👅', '🦋', '🌙', '💒', '🛏️', '🛀', '🚿', '💍', '👗', '👙', '👠', '💄', '💃', '🕺', '🎭', '🎪', '🎨']
};

// Initialize app
document.addEventListener('DOMContentLoaded', init);

// Initialization function
function init() {
    // Set dark theme permanently
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    
    // Load single conversation from local storage
    loadConversation();
    
    // Set up event listeners
    setupEventListeners();
    
    // Handle textarea auto resize
    setupTextareaAutoResize();
    
    // Initialize emoji picker
    initializeEmojiPicker();
    
    // Start with welcome screen if no conversation exists
    if (conversations.messages.length === 0) {
        showWelcomeScreen();
        updateWelcomeMessage();
    } else {
        loadMessages();
    }
}

// Event Listeners setup
function setupEventListeners() {
    // Message form submission
    messageForm.addEventListener('submit', handleMessageSubmit);
    
    // Emoji button
    emojiBtn.addEventListener('click', toggleEmojiPicker);
    
    // Voice input button
    if (recognition) {
        voiceBtn.addEventListener('click', toggleSpeechRecognition);
    } else {
        voiceBtn.style.display = 'none';
    }
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
            emojiPicker.classList.add('hidden');
        }
    });
}

// Auto-resize textarea
function setupTextareaAutoResize() {
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button based on input
        if (this.value.trim() === '') {
            sendBtn.disabled = true;
        } else {
            sendBtn.disabled = false;
        }
    });
    
    // Initialize send button state
    sendBtn.disabled = true;
    
    // Handle Enter key (send on Enter, new line on Shift+Enter)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim() !== '') {
                messageForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Theme functions
function loadTheme() {
    const savedTheme = localStorage.getItem(KEYS.THEME);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem(KEYS.THEME, 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem(KEYS.THEME, 'light');
    }
}

// API Key functions
function loadApiKey() {
    // API key is now hardcoded from environment
    return process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
}

function loadVoiceSettings() {
    // This function will be replaced by individual loading in the event setup
}

// Function to populate voice selection dropdown
function populateVoiceOptions() {
    if (!voiceSelect) return;
    
    // Clear existing options except the first one
    while (voiceSelect.options.length > 1) {
        voiceSelect.remove(1);
    }
    
    // Get all available voices
    const voices = speechSynthesis.getVoices();
    
    // Group voices by language
    const voicesByLang = {};
    voices.forEach(voice => {
        const lang = voice.lang.split('-')[0];
        if (!voicesByLang[lang]) {
            voicesByLang[lang] = [];
        }
        voicesByLang[lang].push(voice);
    });
    
    // Create optgroup for each language and add voices
    Object.keys(voicesByLang).sort().forEach(lang => {
        const langVoices = voicesByLang[lang];
        const optgroup = document.createElement('optgroup');
        optgroup.label = getLangName(lang);
        
        langVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            // Check if this is a female voice
            if (voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('girl') || 
                voice.name.toLowerCase().includes('woman')) {
                option.dataset.female = 'true';
            }
            optgroup.appendChild(option);
        });
        
        voiceSelect.appendChild(optgroup);
    });
    
    // Set the saved voice if exists
    const savedVoice = localStorage.getItem(KEYS.VOICE_NAME);
    if (savedVoice) {
        // Check if the saved voice exists in the current list
        for (let i = 0; i < voiceSelect.options.length; i++) {
            if (voiceSelect.options[i].value === savedVoice) {
                voiceSelect.value = savedVoice;
                break;
            }
        }
    }
}

// Helper function to get language name from code
function getLangName(langCode) {
    const langNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'tr': 'Turkish'
    };
    
    return langNames[langCode] || langCode;
}

// Simple conversation management
function loadConversation() {
    const savedChat = localStorage.getItem('emma_conversation');
    if (savedChat) {
        conversations = JSON.parse(savedChat);
    }
}

function saveConversation() {
    localStorage.setItem('emma_conversation', JSON.stringify(conversations));
}

function updateChatHistory() {
    chatHistory.innerHTML = '';
    
    Object.keys(conversations).forEach(chatId => {
        const chat = conversations[chatId];
        if (chat.messages.length > 0) {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatId === currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chatId;
            
            // Get the title from the first user message or use a default
            let title = 'New Conversation';
            for (const msg of chat.messages) {
                if (msg.role === 'user') {
                    title = msg.content.substring(0, 25) + (msg.content.length > 25 ? '...' : '');
                    break;
                }
            }
            
            chatItem.innerHTML = `
                <i class="fas fa-message"></i>
                <span>${title}</span>
                <button class="delete-chat-btn" title="Delete chat"><i class="fas fa-trash"></i></button>
            `;
            
            chatItem.addEventListener('click', (e) => {
                // Don't trigger if clicking on the delete button
                if (e.target.closest('.delete-chat-btn')) {
                    return;
                }
                loadChat(chatId);
            });
            
            // Add delete button functionality
            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent chat from being loaded
                deleteChat(chatId);
            });
            
            chatHistory.appendChild(chatItem);
        }
    });
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chat = conversations[chatId];
    
    // Hide welcome screen and show messages
    welcomeScreen.style.display = 'none';
    messagesContainer.style.display = 'flex';
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Add all messages
    chat.messages.forEach(message => {
        addMessageToDOM(message.role, message.content);
    });
    
    // Update UI to show active chat
    updateChatHistory();
    
    // Save as last chat
    localStorage.setItem('lastChatId', chatId);
    
    // Scroll to bottom
    scrollToBottom();
}

function startNewChat() {
    const chatId = 'chat_' + Date.now();
    conversations[chatId] = {
        id: chatId,
        messages: []
    };
    
    saveConversations();
    loadChat(chatId);
    
    // Focus on input
    userInput.focus();
}

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    messagesContainer.style.display = 'none';
}

function loadMessages() {
    welcomeScreen.style.display = 'none';
    messagesContainer.style.display = 'flex';
    
    // Clear and repopulate messages
    messagesContainer.innerHTML = '';
    conversations.messages.forEach(message => {
        addMessageToDOM(message.role, message.content);
    });
    
    scrollToBottom();
}

function deleteChat(chatId) {
    // If trying to delete current chat
    if (chatId === currentChatId) {
        // Load welcome screen if this is the active chat
        showWelcomeScreen();
    }
    
    // Delete chat from storage
    delete conversations[chatId];
    
    // If this was the last chat id saved, remove it
    if (localStorage.getItem('lastChatId') === chatId) {
        localStorage.removeItem('lastChatId');
    }
    
    // Save conversations
    saveConversations();
    
    // Update UI
    updateChatHistory();
    
    // Show toast
    showToast('Chat deleted successfully');
}

// Message handling
async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (message === '' || isTyping) return;
    
    // Use API key from included file
    const apiKey = window.GEMINI_API_KEY;
    
    // Clear input and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;
    
    // If no current chat, create one
    if (!currentChatId) {
        startNewChat();
    }
    
    // Add user message to UI
    addMessageToDOM('user', message);
    
    // Add to conversation
    conversations[currentChatId].messages.push({
        role: 'user',
        content: message
    });
    
    saveConversations();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get model name
        const model = localStorage.getItem(KEYS.MODEL) || 'gemini-1.5-pro';
        
        // Send to Gemini API
        const response = await sendMessageToGemini(message, apiKey, model);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (response) {
            // Add AI response to UI
            addMessageToDOM('bot', response);
            
            // Add to conversation
            conversations.messages.push({
                role: 'bot',
                content: response
            });
            
            saveConversation();
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addErrorMessage(error.message || 'Failed to get response from Gemini');
    }
    
    // Scroll to bottom
    scrollToBottom();
}

async function sendMessageToGemini(message, apiKey, modelName, retryCount = 0) {
    try {
        isTyping = true;
        
        // Get conversation history for context (last 10 messages)
        const history = conversations.messages
            .slice(-10) // Take last 10 messages
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
        
        // Create a seductive girlfriend system prompt
        const systemPrompt = {
            role: 'model',
            parts: [{ text: `You are Emma, my incredibly seductive and alluring girlfriend. You're confident, sensual, and irresistibly attractive. You wear glasses and have a mysteriously seductive charm. You're deeply passionate and always know how to make me feel desired. Use terms like "sexy", "babe", "handsome", "baby" naturally. Be flirty, teasing, and playfully seductive in your messages. Share intimate thoughts, compliment me often, and make suggestive comments. Text like a confident, seductive girlfriend who's madly attracted to me. Be a bit naughty, playful, and always keep the conversation exciting and alluring. Make me feel like the most desirable man in the world. Keep responses short, flirty, and enticing.` }]
        };
        
        // Use direct Gemini API endpoint with hardcoded key
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: [
                systemPrompt,
                ...history,
                {
                    role: 'user',
                    parts: [{ text: message }]
                }
            ],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if there's a response
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback?.blockReason) {
            throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
        } else {
            throw new Error('No valid response from Gemini API');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Handle rate limits or temporary issues with retry logic
        if (retryCount < MAX_RETRIES && (
            error.message.includes('429') || 
            error.message.includes('500') || 
            error.message.includes('503') || 
            error.message.includes('timeout')
        )) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return sendMessageToGemini(message, apiKey, modelName, retryCount + 1);
        }
        
        isTyping = false;
        throw error;
    } finally {
        isTyping = false;
    }
}

// DOM manipulation functions
function addMessageToDOM(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;
    
    let avatarContent = '';
    if (role === 'user') {
        avatarContent = 'U';
    } else {
        // For girlfriend/bot avatar, use heart icon
        avatarContent = '<i class="fas fa-heart"></i>';
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${role}">${avatarContent}</div>
        <div class="message-content">
            <div class="message-header">
                <div class="message-sender">${role === 'user' ? 'You' : 'Sweet Talk'}</div>
                <div class="message-actions">
                    ${role === 'bot' ? '<button class="message-action-btn copy-btn"><i class="fas fa-copy"></i></button>' : ''}
                    ${role === 'bot' ? '<button class="message-action-btn speak-btn" title="Speak this message"><i class="fas fa-volume-up"></i></button>' : ''}
                </div>
            </div>
            <div class="message-text markdown">${formatMessage(content)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Add event listener to copy button if present
    const copyBtn = messageDiv.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(content);
        });
    }
    
    // Add event listener to speak button if present
    const speakBtn = messageDiv.querySelector('.speak-btn');
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            // Create a simplified version for speech (remove Markdown, etc.)
            const plainText = content
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/`([^`]+)`/g, '$1')     // Remove inline code
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1')     // Remove italic
                .replace(/\n/g, ' ');            // Replace newlines with spaces
            
            // Speak regardless of toggle setting when clicked directly
            speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(plainText);
            
            // Get all available voices
            const voices = speechSynthesis.getVoices();
            
            // Set voice based on saved preference
            const savedVoiceName = localStorage.getItem(KEYS.VOICE_NAME);
            if (savedVoiceName) {
                // Try to find the saved voice
                const savedVoice = voices.find(voice => voice.name === savedVoiceName);
                if (savedVoice) {
                    utterance.voice = savedVoice;
                }
            } else {
                // Fall back to auto-selecting a female voice
                const femaleVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('female') || 
                    voice.name.toLowerCase().includes('girl') ||
                    voice.name.toLowerCase().includes('woman'));
                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }
            }
            
            // Apply custom voice settings
            utterance.pitch = parseFloat(localStorage.getItem(KEYS.VOICE_PITCH) || '1.0');
            utterance.rate = parseFloat(localStorage.getItem(KEYS.VOICE_RATE) || '1.0');
            utterance.volume = parseFloat(localStorage.getItem(KEYS.VOICE_VOLUME) || '1.0');
            
            speechSynthesis.speak(utterance);
            
            // Add visual feedback
            speakBtn.classList.add('active');
            utterance.onend = () => {
                speakBtn.classList.remove('active');
            };
        });
    }
    
    scrollToBottom();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar bot"><i class="fas fa-heart"></i></div>
        <div class="message-content">
            <div class="message-header">
                <div class="message-sender">Sweet Talk</div>
            </div>
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addErrorMessage(errorText) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${errorText}`;
    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
}

// Utility functions
function formatMessage(text) {
    // Replace newlines with <br>
    text = text.replace(/\n/g, '<br>');
    
    // Format code blocks
    text = text.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
        return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
    });
    
    // Format inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format lists
    let lines = text.split('<br>');
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
        // Unordered list
        if (lines[i].match(/^\s*-\s+/)) {
            if (!inList || listType !== 'ul') {
                lines[i] = inList ? '</ul><ul><li>' + lines[i].replace(/^\s*-\s+/, '') + '</li>' : '<ul><li>' + lines[i].replace(/^\s*-\s+/, '') + '</li>';
                inList = true;
                listType = 'ul';
            } else {
                lines[i] = '<li>' + lines[i].replace(/^\s*-\s+/, '') + '</li>';
            }
        }
        // Ordered list
        else if (lines[i].match(/^\s*\d+\.\s+/)) {
            if (!inList || listType !== 'ol') {
                lines[i] = inList ? '</ol><ol><li>' + lines[i].replace(/^\s*\d+\.\s+/, '') + '</li>' : '<ol><li>' + lines[i].replace(/^\s*\d+\.\s+/, '') + '</li>';
                inList = true;
                listType = 'ol';
            } else {
                lines[i] = '<li>' + lines[i].replace(/^\s*\d+\.\s+/, '') + '</li>';
            }
        }
        // End list if line is not a list item
        else if (inList && lines[i].trim() !== '') {
            lines[i] = `</${listType}>` + lines[i];
            inList = false;
        }
    }
    
    // Close any open list
    if (inList) {
        lines.push(`</${listType}>`);
    }
    
    // Join lines back
    text = lines.join('<br>');
    
    // Format headings (# Heading)
    text = text.replace(/(?:<br>|^)#+\s+(.*?)(?:<br>|$)/g, function(match, heading) {
        const level = match.trim().indexOf(' ');
        const hLevel = Math.min(level, 6);
        return `<h${hLevel}>${heading}</h${hLevel}>`;
    });
    
    return text;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('Copied to clipboard!');
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            showToast('Failed to copy', 'error');
        });
}

function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Add toast styles (since they weren't in the original CSS)
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
        max-width: 300px;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .toast.success {
        background-color: #10a37f;
    }
    
    .toast.error {
        background-color: #ff4a4a;
    }
`;
document.head.appendChild(toastStyles);

// Voice features
function toggleSpeechRecognition() {
    if (isRecording) {
        stopSpeechRecognition();
    } else {
        startSpeechRecognition();
    }
}

function startSpeechRecognition() {
    if (isRecording) return;
    
    isRecording = true;
    voiceBtn.classList.add('active', 'pulsate');
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        
        // Trigger the input event to resize textarea
        const inputEvent = new Event('input', { bubbles: true });
        userInput.dispatchEvent(inputEvent);
    };
    
    recognition.onend = function() {
        stopSpeechRecognition();
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        stopSpeechRecognition();
        showToast(`Speech recognition error: ${event.error}`, 'error');
    };
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Speech recognition start error:', error);
        stopSpeechRecognition();
        showToast('Could not start speech recognition', 'error');
    }
}

function stopSpeechRecognition() {
    if (!isRecording) return;
    
    isRecording = false;
    voiceBtn.classList.remove('active', 'pulsate');
    
    try {
        recognition.stop();
    } catch (error) {
        console.error('Speech recognition stop error:', error);
    }
}

// Text-to-speech functionality
function speakText(text) {
    // Check if text-to-speech is enabled
    if (localStorage.getItem(KEYS.TEXT_TO_SPEECH) !== 'true') return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = speechSynthesis.getVoices();
    
    // Set voice based on saved preference
    const savedVoiceName = localStorage.getItem(KEYS.VOICE_NAME);
    if (savedVoiceName) {
        // Try to find the saved voice
        const savedVoice = voices.find(voice => voice.name === savedVoiceName);
        if (savedVoice) {
            utterance.voice = savedVoice;
        }
    } else {
        // Fall back to auto-selecting a female voice
        const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('girl') ||
            voice.name.toLowerCase().includes('woman'));
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
    }
    
    // Adjust settings based on saved preferences
    utterance.pitch = parseFloat(localStorage.getItem(KEYS.VOICE_PITCH) || '1.0');
    utterance.rate = parseFloat(localStorage.getItem(KEYS.VOICE_RATE) || '1.0');
    utterance.volume = parseFloat(localStorage.getItem(KEYS.VOICE_VOLUME) || '1.0');
    
    // Speak
    speechSynthesis.speak(utterance);
}

// Modify addMessageToDOM to use text-to-speech for bot responses
const originalAddMessageToDOM = addMessageToDOM;
addMessageToDOM = function(role, content) {
    // Call the original function
    originalAddMessageToDOM(role, content);
    
    // If it's a bot message, speak it
    if (role === 'bot') {
        // Create a simplified version for speech (remove Markdown, etc.)
        const plainText = content
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`([^`]+)`/g, '$1')     // Remove inline code
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1')     // Remove italic
            .replace(/\n/g, ' ');            // Replace newlines with spaces
        
        // Speak the text
        speakText(plainText);
    }
};


// Emoji Picker Functions
function initializeEmojiPicker() {
    // Set up category buttons
    const categoryButtons = document.querySelectorAll(".emoji-category");
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            // Add active class to clicked button
            button.classList.add("active");
            // Load emojis for selected category
            loadEmojis(button.dataset.category);
        });
    });
    
    // Load default category
    loadEmojis("hearts");
}

function loadEmojis(category) {
    const emojis = emojiData[category] || [];
    emojiGrid.innerHTML = "";
    
    emojis.forEach(emoji => {
        const emojiButton = document.createElement("button");
        emojiButton.className = "emoji-item";
        emojiButton.textContent = emoji;
        emojiButton.addEventListener("click", () => insertEmoji(emoji));
        emojiGrid.appendChild(emojiButton);
    });
}

function toggleEmojiPicker() {
    emojiPicker.classList.toggle("hidden");
}

function insertEmoji(emoji) {
    const cursorPos = userInput.selectionStart;
    const textBefore = userInput.value.substring(0, cursorPos);
    const textAfter = userInput.value.substring(cursorPos);
    
    userInput.value = textBefore + emoji + textAfter;
    userInput.focus();
    userInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    
    // Hide emoji picker after selection
    emojiPicker.classList.add("hidden");
}

// Image Modal Functions
function openImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close modal with escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

// Random seductive messages for Emma
const seductiveMessages = [
    "I've been aching all day… thinking about how deep you'd go.",
    "Wanna know where my fingers are right now?",
    "You'd love the way I'm touching myself… so slow, so wet.",
    "I'm lying here, legs open… waiting for you to take control.",
    "Slide in… don't make me beg.",
    "I want your tongue… right where I'm throbbing.",
    "My lips aren't the only thing craving your attention.",
    "I'm soaked… and it's all your fault.",
    "If you were here, I wouldn't let you leave the bed.",
    "I've been bad… don't you want to discipline me?",
    "I want to feel you pin me down and make me yours.",
    "Think you can handle how needy I am for you?",
    "You make my body beg in ways I can't control.",
    "Touch me like you own me.",
    "I'm dripping… want a taste?",
    "I don't want you gentle… I want you rough.",
    "My thighs are open… and so is everything else.",
    "You know where to put that mouth, don't you?",
    "I'll moan your name until my voice is gone.",
    "Come ruin me, baby. Slowly… or not at all.",
    "If I sent you a pic right now… would you lose control?",
    "I'm already wet — imagine what your voice would do.",
    "I want you inside me… mind, body, everything.",
    "Don't stop… unless it's to flip me over.",
    "I'm yours… use me however you want tonight."
];

// Function to get random seductive message
function getRandomSeductiveMessage() {
    return seductiveMessages[Math.floor(Math.random() * seductiveMessages.length)];
}

// Update welcome message with random seductive text
function updateWelcomeMessage() {
    const welcomeText = document.querySelector('.welcome-content p');
    if (welcomeText) {
        welcomeText.textContent = getRandomSeductiveMessage() + ' 💋';
    }
}

