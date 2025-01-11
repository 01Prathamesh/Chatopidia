const socket = io.connect('http://localhost:5000');
const usernameInput = document.getElementById('username');
const setNameButton = document.getElementById('setNameButton');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');
const nameInputSection = document.getElementById('nameInputSection');
const messageSection = document.getElementById('messageSection');
const typingIndicator = document.getElementById('typingIndicator');
const toggleDarkModeButton = document.getElementById('toggleDarkMode');
const leaveChatButton = document.getElementById('leaveChatButton');
const emojiPicker = document.querySelector('emoji-picker');  // Emoji picker

let username = localStorage.getItem('username') || 'Anonymous';  // Get saved username or default to 'Anonymous'
let darkMode = localStorage.getItem('darkMode') === 'enabled';  // Check for dark mode status in local storage

// Set the initial username and dark mode state
if (darkMode) document.body.classList.add('dark-mode');
usernameInput.value = username;

// Handle setting username
setNameButton.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name && name !== username) {
        username = name;
        localStorage.setItem('username', username);  // Save the username in local storage
        nameInputSection.style.display = 'none';
        messageSection.style.display = 'block';
        socket.emit('user_joined', { username });
    } else if (!name) {
        alert('Please enter a valid name.');
    }
});

// Dark Mode Toggle
toggleDarkModeButton.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
});

// Send message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send_message', { message, sender: username });
        messageInput.value = '';
    }
});

// Typing indicator
messageInput.addEventListener('input', () => {
    socket.emit('user_typing', { sender: username });
});

// Leave Chat
leaveChatButton.addEventListener('click', () => {
    socket.emit('user_left', { username });
    nameInputSection.style.display = 'block';
    messageSection.style.display = 'none';
    username = 'Anonymous';  // Reset username after leaving
    localStorage.removeItem('username');  // Remove username from local storage
});

// Emoji Picker Integration
emojiPicker.addEventListener('emoji-click', (event) => {
    const emoji = event.detail.unicode;
    messageInput.value += emoji;
    messageInput.focus();
});

// Listen for incoming messages
socket.on('receive_message', function(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    messageElement.innerHTML = `
        <span class="sender">${data.sender}</span>: ${data.message}
        <span class="timestamp">[${timestamp}]</span>
    `;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Listen for typing indicator
socket.on('typing', function(data) {
    typingIndicator.textContent = `${data.sender} is typing...`;
    clearTimeout(typingIndicator.timeout);
    typingIndicator.timeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 2000);
});

// Listen for user join notification
socket.on('user_joined', function(data) {
    const joinMessage = document.createElement('p');
    joinMessage.textContent = `${data.username} has joined the chat.`;
    joinMessage.classList.add('join-leave-message');
    messagesDiv.appendChild(joinMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Listen for user leave notification
socket.on('user_left', function(data) {
    const leaveMessage = document.createElement('p');
    leaveMessage.textContent = `${data.username} has left the chat.`;
    leaveMessage.classList.add('join-leave-message');
    messagesDiv.appendChild(leaveMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Socket.io Error Handling
socket.on('connect_error', () => {
    alert('Connection to the server failed. Please try again later.');
});
