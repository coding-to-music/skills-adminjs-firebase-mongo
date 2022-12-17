# skills-adminjs-firebase-mongo

# 🚀 skills app with adminjs firebase mongo 🚀

https://github.com/coding-to-music/skills-adminjs-firebase-mongo

https://skills-adminjs-firebase-mongo.vercel.app

From / By https://github.com/zairza-cetb/skills-backend

## Environment variables:

```java
# URI of the Mongo DB
MONGO_URI='mongo_uri for storing data

# Firebase credentials
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Nodemailer details

NODEMAILER_EMAIL=
NODEMAILER_PASS=

# AdminJS

ADMINJS_EMAIL=
ADMINJS_PASSWORD=
POSTGRES_URI=
ADMINJS_SECRET=


```

## GitHub

```java
git init
git add .
git remote remove origin
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:coding-to-music/skills-adminjs-firebase-mongo.git
git push -u origin main
```

# Zairza Web Backend

The official backend of Zairza !

## Manual Installation

Clone the repo :

```bash
git clone https://github.com/subrat0796/Zairza-web.git
cd Zairza-web
```

Install the dependencies :

```bash
cd backend && npm install
```

Set the environment variables:

```bash
cp .env.example .env

#open .env and modify the variables according to your needs
```

## Table of Contents

- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Logging](#logging)

## Project Structure

```
src\
 |--api\              # Contains the API folders
     |--controllers\  # Route controllers (controllers layer)
     |--docs\         # Contains the documentation
     |--helpers\      # Helper classes and functions
     |--middlewares\  # Custom express middlewares
     |--models\       # Mongoose models (data layer)
     |--routes\       # Routes
     |--services\     # Business logic (service layer)
     |--validations\  # Request data validation schemas
 |--config\           # Envoriment variables and configuration related things
 |--app.js            # Express app
 |--index.js          # App entry point
```

## Error Handling

The app has centralized error handling mechanism

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
const catchAsync = require("../utils/catchAsync");

const controller = catchAsync(async (req, res) => {
  // this error will be forwarded to the error handling middleware
  throw new Error("Something wrong happened");
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
};
```

## Logging

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
const logger = require("<path to src>/config/logger");

logger.error("message"); // level 0
logger.warn("message"); // level 1
logger.info("message"); // level 2
logger.http("message"); // level 3
logger.verbose("message"); // level 4
logger.debug("message"); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).
