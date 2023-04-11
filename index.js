const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("cookie-session");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./config/errorMiddlewares");

require("dotenv").config();
require("colors");
require("./config/passport");

const PORT = process.env.PORT || 5000;

connectDB();
const app = express();

////// MIDLEWARES //////
app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://techstore-three.vercel.app",
    ],
    credentials: true,
  })
);

// app.set("trust proxy", 1);

app.use(
  session({
    name: "techstoreCookie",
    keys: ["key1", "key2"],
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
);

app.use(passport.initialize());
app.use(passport.session());

////// ROUTES //////

//----ADMIN----//
app.use("/api/admin/tvs", require("./routes/admin/tvs"));
app.use("/api/admin/computers", require("./routes/admin/computers"));
app.use("/api/admin/cellphones", require("./routes/admin/cellphones"));
app.use("/api/admin/accessories", require("./routes/admin/accessories"));
app.use("/api/admin/customers", require("./routes/admin/customers"));
app.use("/api/admin/orders", require("./routes/admin/orders"));

//----USER----//
app.use("/api/users", require("./routes/users"));
app.use("/api/tvs", require("./routes/tvs"));
app.use("/api/computers", require("./routes/computers"));
app.use("/api/cellphones", require("./routes/cellphones"));
app.use("/api/accessories", require("./routes/accessories"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/home", require("./routes/home"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/incomes", require("./routes/incomes"));

app.use(notFound);
app.use(errorHandler);

////// SERVER //////
app.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`.green.underline.bold)
);
