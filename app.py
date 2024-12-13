from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all origins
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('send_message')
def handle_message(data):
    message = data['message']
    sender = data.get('sender', 'Anonymous')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Remove database-related code to prevent saving messages
    # No database interaction, just broadcasting the message to other clients.
    
    print(f"Message from {sender}: {message} ->at {timestamp}")  # Debugging output

    # Emit the message with timestamp to all connected clients
    emit('receive_message', {'message': message, 'sender': sender, 'timestamp': timestamp}, broadcast=True)

@socketio.on('user_typing')
def handle_typing(data):
    sender = data.get('sender')
    emit('typing', {'sender': sender}, broadcast=True)

@socketio.on('user_joined')
def handle_user_joined(data):
    username = data.get('username')
    emit('user_joined', {'username': username}, broadcast=True)

@socketio.on('user_left')
def handle_user_left(data):
    username = data.get('username')
    emit('user_left', {'username': username}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
