import user from "../models/user.js";
import bcrypt from "bcrypt";

class AccountValidation {
  constructor(model) {
    this.userModel = model;
  }

  async emailExists(email) {
    const result = await this.userModel.findOne({ email });

    if (result) {
      console.log(email, "already exists, please try another email");
      return true;
    } else {
      return false;
    }
  }

  async Login(email, password) {
    // Validasi format email
    const emailValidation = this.validateEmailFormat(email);

    if (!emailValidation) {
      return { status: "failed", message: "invalid email format" };
    }

    // Validasi keberadaan email di database
    const user = await this.userModel.findOne({ email });
    if (!user)
      return {
        status: "failed",
        message: "email not found, please register first!",
      };

    // Validasi password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return { status: "failed", message: "incorrect password" };

    // console.log(user._id);

    return {
      status: "success",
      data: {
        userId: user.userId,
        email: user.email,
        isAuthenticated: user.isAuthenticated,
        name: user.name,
      },
    };
  }

  validateEmailFormat(email) {
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (emailRegex.test(email)) {
      console.log("Email format is valid:", email);
      return true;
    } else {
      console.log("Email format is invalid:", email);
      // return { status: "failed", message: "invalid email format" };
      return false;
    }
  }

  async validateUsernamme(name) {
    const user = await this.userModel.findOne({ name });

    return user ? true : false;
  }
}

export default AccountValidation;
