const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const uri =
      process.env.NODE_ENV === "development"
        ? process.env.MONGO_URI_LOCAL
        : process.env.MONGO_URI;

    const conn = await mongoose.connect(uri);
    console.log(
      `MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.log(`Error Connected MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
