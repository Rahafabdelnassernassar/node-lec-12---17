const mongoose = require("mongoose");
const validator = require("validator");

const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      let password = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!password.test(value))
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email format");
      }
    },
    // match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  age: {
    type: Number,
    default: 18,
    validate(value) {
      if (value <= 0) {
        throw new Error("Age must be a positive number");
      }
    },
  },
  tokens: [
    {
      type: String,
      required: true,
    },
  ],
});

userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    const existingUser = await User.findById(this._id);

    if (existingUser) {
      const isSamePassword = await bcryptjs.compare(
        user.password,
        existingUser.password
      );

      if (isSamePassword) {
        user.password = existingUser.password;
      } else {
        user.password = await bcryptjs.hash(user.password, 8);
      }
    } else {
      user.password = await bcryptjs.hash(user.password, 8);
    }
  }
  // user.password = await bcryptjs.hash(user.password, 8);
});

/////////////////////////////////////////////////////////////////

//login

userSchema.statics.findByCredentials = async (em, pass) => {
  const user = await User.findOne({ email: em });

  if (!user) throw new Error("Unable to login");

  const isMatch = await bcryptjs.compare(pass, user.password);

  if (!isMatch) throw new Error("Unable to login");

  return user;
};
/////////////////////////////////////////

//token
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "rahaf2004");
  user.tokens = user.tokens.concat(token);
  await user.save();
  return token;
};
///////////////////////////////////////////////////////////////////
//hide pass and token

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
