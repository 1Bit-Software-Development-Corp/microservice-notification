# Change to the project directory

git checkout $SITE_BRANCH
# Pull the latest changes from the git repository
git reset --hard
git clean -df
git pull


# Install dependencies
npm install

COMMIT_AUTHOR=$(git log -1 --pretty=%an | cat)
COMMIT_MESSAGE=$(git log -1 --pretty=%B | cat | tr -d '"' | sed '/^[[:space:]]*$/d')


./notif.sh "Butterfly Notification Websocket microservice deployment on Development server completed [${COMMIT_AUTHOR}]: ${COMMIT_MESSAGE}"