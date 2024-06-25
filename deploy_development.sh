#!/bin/bash

git checkout $SITE_BRANCH
# Pull the latest changes from the git repository
git reset --hard
git clean -df
git pull

# Load nvm and use specific Node.js version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

npm install
pm2 list
pm2 restart microservice-notification

COMMIT_AUTHOR=$(git log -1 --pretty=%an | cat)
COMMIT_MESSAGE=$(git log -1 --pretty=%B | cat | tr -d '"' | sed '/^[[:space:]]*$/d')


./notif.sh "Butterfly Notification Websocket microservice deployment on Development server completed [${COMMIT_AUTHOR}]: ${COMMIT_MESSAGE}"