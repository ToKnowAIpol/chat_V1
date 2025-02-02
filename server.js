// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store messages and AI toggle state in memory
const messages = new Map();
let aiEnabled = true;

// Middleware for JSON and static files
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Routes for customer and admin pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

// Admin API endpoints
app.get('/api/admin/ai-toggle', (req, res) => {
  res.json({ enabled: aiEnabled });
});

app.post('/api/admin/ai-toggle', (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Invalid toggle state' });
  }
  aiEnabled = enabled;
  res.json({ enabled: aiEnabled });
});

// Endpoint do wysyłania wiadomości
app.post('/api/chat/:chatId/message', async (req, res) => {
  const { chatId } = req.params;
  const { message, sender } = req.body;
  
  if (!messages.has(chatId)) {
    messages.set(chatId, []);
  }
  
  const newMessage = {
    chat_id: chatId,
    sender,
    message,
    created_at: new Date().toISOString()
  };
  
  messages.get(chatId).push(newMessage);
  io.to(chatId).emit('new_message', newMessage);
  res.status(201).json(newMessage);
});

// AI message endpoint
app.post('/api/chat/:chatId/message/ai', async (req, res) => {
  if (!aiEnabled) {
    return res.status(403).json({ error: 'AI responses are currently disabled' });
  }

  const { chatId } = req.params;
  const { message } = req.body;

  try {
    const response = await fetch("https://toknowai.onrender.com/api/v1/prediction/b942e405-3055-42f1-94c7-dd57f5728921", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message })
    });
    
    const data = await response.json();
    console.log("Otrzymana odpowiedź z AI (pełna):", JSON.stringify(data, null, 2));
    
    // Sprawdzamy różne możliwe struktury odpowiedzi
    const answer = data.text || // sprawdzamy czy odpowiedź jest w data.text
                  (data.answer && data.answer.text) || // lub data.answer.text
                  data.answer || // lub bezpośrednio w data.answer
                  data.response || // lub w data.response
                  (data.output && data.output.text) || // lub w data.output.text
                  (data.result && data.result.text) || // lub w data.result.text
                  "Brak odpowiedzi z AI";
    
    console.log("Wyłuskana odpowiedź:", answer);
    
    if (!messages.has(chatId)) {
      messages.set(chatId, []);
    }
    
    const aiMessage = {
      chat_id: chatId,
      sender: 'ai',
      message: answer,
      created_at: new Date().toISOString(),
      type: 'ai'
    };
    
    messages.get(chatId).push(aiMessage);
    io.to(chatId).emit('new_message', aiMessage);
    res.status(201).json(aiMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd przy wywołaniu AI' });
  }
});

// Endpoint do pobierania historii wiadomości
app.get('/api/chat/:chatId/messages', (req, res) => {
  const { chatId } = req.params;
  const chatMessages = messages.get(chatId) || [];
  res.json(chatMessages);
});

// Konfiguracja Socket.IO - połączenia i dołączanie do pokoju czatu
io.on('connection', (socket) => {
  console.log('Nowe połączenie Socket.IO');
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket dołączył do pokoju czatu: ${chatId}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
