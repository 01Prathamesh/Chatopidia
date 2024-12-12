const socket = io.connect('http://localhost:5000'); // Assuming backend is running locally

const usernameInput = document.getElementById('username');
const setNameButton = document.getElementById('setNameButton');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');
const nameInputSection = document.getElementById('nameInputSection');
const messageSection = document.getElementById('messageSection');

let username = 'Anonymous';  // Default username

// Handle setting username
setNameButton.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        username = name;  // Set username to input value
        nameInputSection.style.display = 'none';  // Hide name input section
        messageSection.style.display = 'block';  // Show message input section
    } else {
        alert('Please enter a valid name.');
    }
});

// Log the connection status
socket.on('connect', function() {
    console.log('Connected to the server!');
});

// Send message on button click
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== "") {
        console.log('Sending message:', message);  // Debug: Log the message being sent
        socket.emit('send_message', { message, sender: username });
        messageInput.value = '';  // Clear input after sending
    } else {
        console.log('Empty message, not sent');
    }
});

// Listen for incoming messages and display them
socket.on('receive_message', function(data) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${data.sender}: ${data.message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
});
