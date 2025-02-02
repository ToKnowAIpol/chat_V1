# Chat Application with AI Integration

Simple chat application with AI integration using Node.js, Express, Socket.IO, and AI API integration.

## Features

- Real-time chat using Socket.IO
- AI-powered responses using external API
- Simple and clean UI
- Message history
- Support for multiple chat rooms

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ToKnowAIpol/chat_V1.git
cd chat_V1
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

- Type a message and click "Wyślij" to send a regular message
- Click "Zapytaj AI" to get an AI-powered response
- Messages are displayed in real-time and stored in memory
- User messages appear in blue, AI responses in gray

## Project Structure

- `server.js` - Main server file with Express and Socket.IO setup
- `public/index.html` - Frontend interface
- `package.json` - Project dependencies and scripts

## Dependencies

- Express.js
- Socket.IO
- node-fetch

## License

MIT
