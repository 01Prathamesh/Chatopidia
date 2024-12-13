const socket = io.connect(window.location.origin, { transports: ['websocket', 'polling'] });  // Allow both WebSocket and polling
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

let username = 'Anonymous';
let darkMode = false;
let typingTimeout;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Handle setting username
setNameButton.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        username = name;
        nameInputSection.style.display = 'none';
        messageSection.style.display = 'block';
        socket.emit('user_joined', { username });
    } else {
        alert('Please enter a valid name.');
    }
});

// Dark Mode Toggle
toggleDarkModeButton.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
});

// Send message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send_message', { message, sender: username });
        messageInput.value = '';
    }
});

// Typing indicator with debounce
messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('user_typing', { sender: username });
    }, 500); // Emit after 500ms of inactivity
});

// Leave Chat
leaveChatButton.addEventListener('click', () => {
    socket.emit('user_left', { username });
    nameInputSection.style.display = 'block';
    messageSection.style.display = 'none';
    username = 'Anonymous';  // Reset username after leaving
});

// Listen for incoming messages
socket.on('receive_message', function(data) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `[${data.timestamp}] ${data.sender}: ${data.message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Listen for typing indicator
socket.on('typing', function(data) {
    typingIndicator.textContent = `${data.sender} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = '';
    }, 2000); // Clear after 2 seconds
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

// Handle socket connection error
socket.on('connect_error', (error) => {
    console.log('Connection failed: ', error);
    alert('Connection to server failed. Trying again...');
    
    // Retry after a delay
    setTimeout(() => {
        socket.connect();
    }, 2000);
});

// Handle disconnection and auto-reconnect with attempts
socket.on('disconnect', () => {
    console.log('Disconnected. Trying to reconnect...');
    if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
            socket.connect(); // Reconnect automatically after delay
        }, 2000);
    } else {
        alert('Failed to reconnect after multiple attempts.');
    }
});
