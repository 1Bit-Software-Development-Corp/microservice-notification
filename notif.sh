#!/bin/bash
MESSAGE=$1
# CHAT_ID=-754691664 #BE gc 
CHAT_ID=-944233761 #Butterfly gc

if [ -z "${MESSAGE}" ];  then echo "Usage: ./notif.sh <MESSAGE>"; exit; fi

curl --request POST \
  --url https://api.telegram.org/bot7137332174:AAFJXU2pJ_aliJYR2a8PIGVArxPgq9YSErw/sendMessage \
  --header 'Content-Type: application/json' \
  --data "{
	\"chat_id\": \"${CHAT_ID}\",
	\"text\": \"${MESSAGE}\"
}"