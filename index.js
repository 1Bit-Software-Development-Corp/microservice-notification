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
    const notification = JSON.parse(message);
    console.log(`Received message from ${channel} channel.`, notification);
    console.log("Connections", Object.keys(connections))
    // Broadcast message to specific user
    if (channel === socketNotifChannel && connections[notification.user_id]) {
      connections[notification.user_id].emit(socketNotifChannel + '_' + notification.user_id, notification);
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

const connections = {};
io.on('connection', (socket) => {
  let userId = { current: null };
  console.log('A user connected, socket ID:', socket.id);

  socket.on("init-connect", ({ user_id }) => {
    userId.current = user_id;
    connections[user_id.current] = socket;
    console.log('[Connect] User connected:', userId.current);
  });

  //Chat Event
  socket.on(socketChatChannel, (data) => {
    console.log(`[Debug] ${socketChatChannel} message received:`, data);
    let channelName;
    if (useProtobuf) {
      const message = ChatMessage.deserializeBinary(data);
      var messageObj = {
        'message': message.getMessage(),
        'from_id': message.getFromUserId(),
        'to_id': message.getToUserId()
      }
      channelName = socketChatChannel + '_' + message.getChannelName();
    } else {
      var messageObj = data;
      channelName = socketChatChannel + '_' + messageObj.privateChannel;
    }

    if (connections[messageObj.to_id]) {
      connections[messageObj.to_id].emit(channelName, data)
    }

    messageObj.created_at = new Date();
    redisPub.publish(socketChatChannel, JSON.stringify(messageObj));
    console.log("Published %s to %s", data.toString('binary'), socketChatChannel);
  });

  //Like, Comment Event
  socket.on(socketNotifChannel, (data) => {
    console.log(`[Debug] ${socketNotifChannel} message received:`, data);

    let channelName;
    let toUserId;
    if (useProtobuf) {
      const notification = NotifMessage.deserializeBinary(data);
      var notificationObj = {
        'message': notification.getMessage(),
        'from_id': notification.getFromUserId(),
        'to_id': notification.getToUserId()
      }
      toUserId = notification.getToUserId();
      channelName = socketChannel + '_' + toUserId;
    } else {
      const notificationObj = data;
      toUserId = notificationObj.toUserId;
      channelName = socketChannel + '_' + toUserId;
    }

    if (connections[toUserId]) {
      connections[toUserId].emit(channelName, data);
    }

    redisPub.publish(socketNotifChannel, JSON.stringify(notificationObj));
    console.log("Published %s to %s", data.toString('binary'), socketNotifChannel);
  });

  socket.on('disconnect', (socket) => {
    delete connections[userId.current]
    console.log('User disconnected:', userId.current);
  });
});

server.listen(servicePort, () => {
  console.log(`Server is running on port ${servicePort}`);
});
