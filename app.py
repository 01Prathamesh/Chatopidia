from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS  # Import CORS
import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all origins (for testing purposes, you can refine this later)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")  # Allow connections from all origins

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

    # Debugging print statement
    print(f"Received message: {message} from {sender}")

    # Save message to the database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO messages (message, sender) VALUES (%s, %s)", (message, sender))
        conn.commit()
        cursor.close()
        conn.close()

        print("Message saved to the database!")
    except Exception as e:
        print(f"Database error: {e}")

    # Emit the message to all connected clients
    emit('receive_message', {'message': message, 'sender': sender}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
