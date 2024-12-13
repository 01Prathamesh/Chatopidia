from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import logging

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for Vercel frontend domain
CORS(app, origins=["https://chatopidia.vercel.app", "http://chatopidia.vercel.app"])

# Initialize SocketIO with ping options for better connection stability
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=10, ping_timeout=60)

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Handle incoming messages
@socketio.on('send_message')
def handle_message(data):
    message = data['message']
    sender = data.get('sender', 'Anonymous')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Log the incoming message for debugging
    logger.debug(f"Message from {sender}: {message} -> at {timestamp}")

    # Emit the message to all connected clients with the timestamp
    emit('receive_message', {'message': message, 'sender': sender, 'timestamp': timestamp}, broadcast=True)

# Handle typing indicator
@socketio.on('user_typing')
def handle_typing(data):
    sender = data.get('sender')
    emit('typing', {'sender': sender}, broadcast=True)

# Handle user joining the chat
@socketio.on('user_joined')
def handle_user_joined(data):
    username = data.get('username')
    emit('user_joined', {'username': username}, broadcast=True)

# Handle user leaving the chat
@socketio.on('user_left')
def handle_user_left(data):
    username = data.get('username')
    emit('user_left', {'username': username}, broadcast=True)

# Handle disconnect (in case user closes the browser unexpectedly)
@socketio.on('disconnect')
def handle_disconnect():
    emit('user_left', {'username': 'A user'}, broadcast=True)

# Run the application
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
