// // server.js
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const { v4: uuidv4 } = require('uuid');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*' }
// });

// const clients = {}; // clientId -> socketId

// io.on('connection', socket => {
//   console.log('socket connected:', socket.id);

//   // Client tells server its chosen clientId (or server can assign)
//   socket.on('join', (clientId) => {
//     if (!clientId) clientId = uuidv4();
//     clients[clientId] = socket.id;
//     socket.clientId = clientId;

//     // broadcast the updated client list (array of IDs)
//     io.emit('clients', Object.keys(clients));
//     console.log('join', clientId);
//   });

//   // offer -> forward to specific client
//   socket.on('offer', ({ to, from, sdp }) => {
//     const toSocket = clients[to];
//     if (toSocket) io.to(toSocket).emit('offer', { from, sdp });
//   });

//   socket.on('answer', ({ to, from, sdp }) => {
//     const toSocket = clients[to];
//     if (toSocket) io.to(toSocket).emit('answer', { from, sdp });
//   });

//   socket.on('ice-candidate', ({ to, from, candidate }) => {
//     const toSocket = clients[to];
//     if (toSocket) io.to(toSocket).emit('ice-candidate', { from, candidate });
//   });

//   socket.on('disconnect', () => {
//     if (socket.clientId) {
//       console.log('disconnect', socket.clientId);
//       delete clients[socket.clientId];
//       io.emit('clients', Object.keys(clients));
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Signaling server listening on ${PORT}`));

// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const clients = {}; // clientId -> socketId

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join", (clientId) => {
    if (!clientId) clientId = uuidv4();
    clients[clientId] = socket.id;
    socket.clientId = clientId;

    io.emit("clients", Object.keys(clients)); // broadcast list
    console.log("join", clientId);
  });

  socket.on("offer", ({ to, from, sdp, pcIndex }) => {
    const toSocket = clients[to];
    if (toSocket) io.to(toSocket).emit("offer", { from, sdp, pcIndex });
  });

  socket.on("answer", ({ to, from, sdp, pcIndex }) => {
    const toSocket = clients[to];
    if (toSocket) io.to(toSocket).emit("answer", { from, sdp, pcIndex });
  });

  socket.on("ice-candidate", ({ to, from, candidate, pcIndex }) => {
    const toSocket = clients[to];
    if (toSocket)
      io.to(toSocket).emit("ice-candidate", { from, candidate, pcIndex });
  });
  socket.on("call", ({ to, from }) => {
    const toSocket = clients[to];
    if (toSocket) io.to(toSocket).emit("call", { from });
  });

  socket.on("call-response", ({ to, from, accepted }) => {
    const toSocket = clients[to];
    if (toSocket) io.to(toSocket).emit("call-response", { to: from, accepted });
  });

  socket.on("disconnect", () => {
    if (socket.clientId) {
      console.log("disconnect", socket.clientId);
      delete clients[socket.clientId];
      io.emit("clients", Object.keys(clients));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server listening on ${PORT}`));
