# Change to the project directory

# Turn on maintenance mode
pm2 stop microservice-notification

git checkout $SITE_BRANCH
# Pull the latest changes from the git repository
git reset --hard
git clean -df
git pull


# Install dependencies
npm install

# Restart pm2 instance
pm2 restart microservice-notification

COMMIT_AUTHOR=$(git log -1 --pretty=%an | cat)
COMMIT_MESSAGE=$(git log -1 --pretty=%B | cat | tr -d '"' | sed '/^[[:space:]]*$/d')


./notif.sh "butterfly-api-BE deployment on Development server completed [${COMMIT_AUTHOR}]: ${COMMIT_MESSAGE}"