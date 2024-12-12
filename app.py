from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)

# Database connection setup using environment variables
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('send_message')
def handle_message(data):
    message = data['message']
    sender = data.get('sender', 'Anonymous')

    # Save message to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO messages (message, sender) VALUES (%s, %s)", (message, sender))
    conn.commit()
    cursor.close()
    conn.close()

    # Emit the message to all clients
    emit('receive_message', {'message': message, 'sender': sender}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
