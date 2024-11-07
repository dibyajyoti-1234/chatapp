const socket = io('http://localhost:3000');
const form = document.getElementById('send-container');
const inputMessage = document.getElementById('messageinp'); // Renamed to avoid conflict
const messageContainer = document.querySelector('.container');
var audio = new Audio('ting.mp3');

// Prompt the user to enter their name when they join
const userName = prompt("Enter your name to join the chat");
socket.emit('new-user-joined', userName); // Emit the new user event

// Function to append messages to the chat container
const appendMessage = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position); // Position can be 'left' or 'right'
    messageContainer.append(messageElement);
    if (position === 'left') {
        audio.play();
    }
};

// Listen for the 'user-joined' event and display the message
socket.on('user-joined', name => {
    appendMessage(`${name} joined the chat`, 'right'); // Append as a system message
});

// Listen for the 'received' event and display the incoming message
socket.on('received', data => {
    appendMessage(`${data.name}: ${data.message}`, 'left'); // Append messages from other users
});

// Listen for the 'left' event and display the message
socket.on('left', name => {
    appendMessage(`${name} left the chat`, 'left');
});

// Handle form submission (sending messages)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission and page refresh
    const message = inputMessage.value;
    appendMessage(`You: ${message}`, 'right'); // Append your own message on the right
    socket.emit('send', message); // Send message to the server
    inputMessage.value = ''; // Clear the input field after sending
});

// Voice recognition setup
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const voiceBtn = document.getElementById('voice-btn'); // Button for voice input
    voiceBtn.addEventListener('click', () => {
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        appendMessage(`You: ${transcript}`, 'right'); // Display the recognized text as your own message
        socket.emit('send', transcript); // Send the recognized text to the server
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
    };
} else {
    console.warn('Speech Recognition not supported in this browser.');
}
