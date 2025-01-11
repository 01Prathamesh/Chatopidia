from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import logging

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all origins or set specific origins for production (useful for security)
CORS(app)

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins=os.getenv('CORS_ALLOWED_ORIGINS', '*'))

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Handle message event
@socketio.on('send_message')
def handle_message(data):
    message = data['message']
    sender = data.get('sender', 'Anonymous')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    logger.debug(f"Message from {sender}: {message} at {timestamp}")
    
    # Emit the message with timestamp to all connected clients
    emit('receive_message', {'message': message, 'sender': sender, 'timestamp': timestamp}, broadcast=True)

# Handle typing event
@socketio.on('user_typing')
def handle_typing(data):
    sender = data.get('sender')
    logger.debug(f"{sender} is typing...")
    emit('typing', {'sender': sender}, broadcast=True)

# Handle user joining event
@socketio.on('user_joined')
def handle_user_joined(data):
    username = data.get('username')
    logger.info(f"{username} has joined the chat")
    emit('user_joined', {'username': username}, broadcast=True)

# Handle user leaving event
@socketio.on('user_left')
def handle_user_left(data):
    username = data.get('username')
    logger.info(f"{username} has left the chat")
    emit('user_left', {'username': username}, broadcast=True)

if __name__ == '__main__':
    # Run the app with debugging enabled for local development
    socketio.run(app, host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
