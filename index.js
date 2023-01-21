const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const MongoStore = require("connect-mongo");
const { notFound, errorHandler } = require("./config/errorMiddlewares");

require("dotenv").config();
require("colors");
require("./config/passport");

connectDB();
const app = express();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  ttl: 24 * 60 * 60 * 100 * 30,
});

////// MIDLEWARES //////
app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 100 * 30,
      signed: true,
    },
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

////// ROUTES //////
app.use("/api/users", require("./routes/users"));
app.use("/api/tvs", require("./routes/tvs"));

app.use(notFound);
app.use(errorHandler);

////// SERVER //////
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`.green.underline.bold)
);
