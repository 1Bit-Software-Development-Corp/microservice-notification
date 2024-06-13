# ENV Sample
MICROSERVICE_PORT=3000

REDIS_PORT=6379

REDIS_HOST="192.168.56.56"

REDIS_DB=0

REDIS_CHANNEL="butterfly-chat"

SOCKET_CHANNEL="butterfly-chat"

# Protobuf object
message ChatMessage {
  string message = 1;
  string from_user_id = 2;
  string to_user_id = 3;
  string attachment_url  = 4;
  string channel_name = 5;
}

# Pre requisite
npm install


# NPM Command
start:server

# Sample Chat React App Using Microservice
https://github.com/1Bit-Software-Development-Corp/sample-chat


# Microservice Purpose
![image](https://github.com/1Bit-Software-Development-Corp/microservice-notification/assets/167732876/790ede86-1fa0-4d82-abf6-3fdd1d8158c4)

