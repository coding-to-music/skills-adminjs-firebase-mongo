const mongoose = require("mongoose");
const express = require("express");
const adminJS = require("adminjs");
const adminJSExpress = require("@adminjs/express");
const adminJSMongoose = require("@adminjs/mongoose");
const connect = require("connect-pg-simple");
const session = require("express-session");
const cors = require("cors");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const httpStatus = require("http-status");

const config = require("./config/config");
const logger = require("./config/logger");
const { errorConverter, errorHandler } = require("./api/middlewares/error");
const ApiError = require("./api/helpers/ApiError");

const {
  DomainRegistrations,
  Domains,
  SkillUsers,
} = require("./api/models/skills");

let server;

const authenticate = async (email, password) => {
  if (email === config.adminJS.email && password === config.adminJS.password) {
    return Promise.resolve({ email, password });
  }
  return null;
};

adminJS.registerAdapter({
  Resource: adminJSMongoose.Resource,
  Database: adminJSMongoose.Database,
});

mongoose.connect(config.mongoose.url).then(() => {
  const app = express();

  logger.info("Connected to Mongodb");

  const adminOptions = {
    // We pass Category to `resources`
    resources: [DomainRegistrations, Domains, SkillUsers],
    rootPath: "/admin",
    // We pass authenticate function to AdminJS
    authenticate,
  };

  const admin = new adminJS(adminOptions);

  const ConnectSession = connect(session);
  const sessionStore = new ConnectSession({
    conObject: {
      connectionString: config.adminJS.postgres,
      ssl: true,
    },
    tableName: "session",
    createTableIfMissing: true,
  });

  const adminRouter = adminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: config.adminJS.secret,
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: config.adminJS.secret,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "adminjs",
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  app.use(express.json());

  // parsing urlencoded data
  app.use(express.urlencoded({ extended: true }));

  // sanitize request data
  app.use(xss());
  app.use(mongoSanitize());

  // enable cors
  app.use(cors());

  // sending back 404 for any unknown api request

  app.get("/", async (req, res, next) => {
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      status: httpStatus[200],
      message: "Hi welcome to Zairza Backend",
      data: null,
    });
  });

  require("./api/routes/index")(app);

  app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
  });

  // convert error to ApiError , if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);

  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
