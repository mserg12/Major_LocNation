import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("New user connected:", userId);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    } else {
      console.log("Receiver not found!");
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4002, () => {
  console.log("Socket.IO server running on port 4002");
});
