const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    username: { type: String, require: true },
    email: { type: String, default: "" },
    password: { type: String, require: true },
    provider: { type: String, default: "local" },
    providerId: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.password) {
    if (!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password, 8);
  }
});

userSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
