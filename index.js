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
  redisSub = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST, 
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD || null,
  });
  redisSub.on('connect', () => {
    console.log('Successfully connected to Redis');
  });

  redisSub.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  // Subscribe to Notification
  redisSub.subscribe(socketNotifChannel, (err, count) => {
    if (err) {
      console.error('Failed to subscribe: %s', err.message);
    } else {
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
  });
  // Listen for messages; Notif from BE
  redisSub.on('message', (channel, message) => {
    console.log(`Received message from ${channel} channel.`);
    const notification = JSON.parse(message);
    // Broadcast message to all connected clients
    if (channel === socketNotifChannel) {
      io.emit(socketNotifChannel + '_' + notification.user_id, notification);
      console.log(`Message Emitted to  ${socketNotifChannel + '_' + notification.user_id} in FE. message is as follow ${notification}`);
    } 
  });
} catch (error) {
  console.error('Failed to connect to Redis:', error);
  process.exit(1); // Exit the process if Redis connection fails
}


redisPub = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST, 
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD || null,
});
//check socket io
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  //Chat Event
  socket.on(socketChatChannel, (data) => {
    console.log('Message received:', data);
    
    if (useProtobuf) {
      const message = ChatMessage.deserializeBinary(data);
      var messageObj = {
        'message': message.getMessage(),
        'from_id': message.getFromUserId(),
        'to_id': message.getToUserId()
      }
      io.emit(socketChatChannel + '_' + message.getChannelName(), data);
    } else {
      var messageObj = data;
      io.emit(socketChatChannel + '_' + messageObj.privateChannel, data);
    }
    redisPub.publish(socketChatChannel, JSON.stringify(messageObj));
    console.log("Published %s to %s", data.toString('binary'), socketChatChannel);
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
    redisPub.publish(socketNotifChannel, data);
    console.log("Published %s to %s", data, socketNotifChannel);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(servicePort, () => {
  console.log(`Server is running on port ${servicePort}`);
});
