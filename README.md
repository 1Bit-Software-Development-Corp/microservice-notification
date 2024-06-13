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
  int32 from_user_id = 2;
  int32 to_user_id = 3;
}

# Pre requisite
npm install

npm build

# NPM Command
start:server


# Microservice Purpose
![image](https://github.com/1Bit-Software-Development-Corp/microservice-notification/assets/167732876/790ede86-1fa0-4d82-abf6-3fdd1d8158c4)

