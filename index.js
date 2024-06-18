const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');

const servicePort = process.env.MICROSERVICE_PORT;
const socketChatChannel = process.env.SOCKET_CHAT_CHANNEL;
const socketNotifChannel = process.env.SOCKET_NOTIF_CHANNEL;
const redisChatChannel = process.env.REDIS_CHAT_CHANNEL;
const redisNotificationChannel = process.env.REDIS_NOTIFICATION_CHANNEL;
const app = express();
const server = http.createServer(app);
const { ChatMessage } = require('./protos/chat_pb');
const { NotifMessage } = require('./protos/notification_pb');
const useProtobuf = process.env.USE_PROTOBUF === 'true';

const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});


let redis;
try {
  redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST, 
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD || null,
  });
  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  // Subscribe to Notification
  redis.subscribe(socketNotifChannel, (err, count) => {
    if (err) {
      console.error('Failed to subscribe: %s', err.message);
    } else {
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
  });
  // Listen for messages; Notif from BE
  redis.on('message', (channel, message) => {
    console.log(`Received message from ${channel} channel.`);
    const notification = data;
    // Broadcast message to all connected clients
    if (channel === socketNotifChannel) {
      io.emit(socketNotifChannel + '_' + message.toUserId, notification);
    } 
  });
} catch (error) {
  console.error('Failed to connect to Redis:', error);
  process.exit(1); // Exit the process if Redis connection fails
}

//check socket io
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  //Chat Event
  socket.on(socketChatChannel, (data) => {
    console.log('Message received:', data);
    
    if (useProtobuf) {
      const message = ChatMessage.deserializeBinary(data);
      io.emit(socketChatChannel + '_' + message.getChannelName(), data);
    } else {
      const message = data;
      io.emit(socketChatChannel + '_' + message.privateChannel, data);
    }
    redis.publish(redisChatChannel, data.toString('binary'));
    console.log("Published %s to %s", data, redisChatChannel);
  });

  //Like, Comment Event
  socket.on(socketNotifChannel, (data) => {
    console.log('Notification received:', data);

    if (useProtobuf) {
      const notification = NotifMessage.deserializeBinary(data);
      io.emit(socketChannel + '_' + message.getToUserId(), notification);
    }else {
      const message = data;
      io.emit(socketChannel + '_' + message.toUserId, notification);
    }
    redis.publish(redisNotificationChannel, data.toString('binary'));
    console.log("Published %s to %s", data, redisNotificationChannel);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(servicePort, () => {
  console.log(`Server is running on port ${servicePort}`);
});
