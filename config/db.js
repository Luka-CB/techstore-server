const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI_PRODUCTION);
    console.log(
      `MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.log(`Error Connected MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
