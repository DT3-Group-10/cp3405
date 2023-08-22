const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve your game files and assets using Express
app.use(express.static(__dirname + '/public'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Handle player movement updates
  socket.on('move', (direction) => {
    // Broadcast the movement to all players except the sender
    socket.broadcast.emit('move', { playerId: socket.id, direction });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Notify other players about the disconnect
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
