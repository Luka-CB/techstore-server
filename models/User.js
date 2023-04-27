const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    provider: { type: String, default: "local" },
    providerId: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    orders: [{ type: String, required: true }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePaginate);

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
