const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');

const servicePort = process.env.MICROSERVICE_PORT;
const socketChannel = process.env.SOCKET_CHANNEL;
const redisChannel = process.env.REDIS_CHANNEL;
const app = express();
const server = http.createServer(app);
const { ChatMessage } = require('./protos/chat_pb');

const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST, 
    db: process.env.REDIS_DB
});

//check socket io
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on(socketChannel, (data) => {
    console.log('Message received:', data);

    const message = ChatMessage.deserializeBinary(data);
    const messageObj = {
      message: message.getMessage(),
      fromUserId: message.getFromUserId(),
      toUserId: message.getToUserId()
    };

    console.log('Message decoded:', messageObj);
    //emit back to react app
    io.emit(socketChannel, data);
    //for local test only if connecting to redis
    redis.set(redisChannel, data.toString('binary'));
    //publish for subscriber
    redis.publish(redisChannel, data.toString('binary'));
    console.log("Published %s to %s", data, redisChannel);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


server.listen(servicePort, () => {
  console.log(`Server is running on port ${servicePort}`);
});
