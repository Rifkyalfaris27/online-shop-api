import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import user from "../models/user.js";
import bcrypt from "bcrypt";
import AccountValidation from "../validation/AccountValidation.js";

import dotenv from "dotenv";
dotenv.config();

const routes = express.Router();
const userService = new AccountValidation(user);

// function isAuthenticated(req, res, next) {
//   if (req.session && req.session.isAuthenticated) {
//     // res.send({ message: "test doang" });
//     return next();
//   }
//   return res.status(401).send({ message: "Unauthorized: Please login first." });
// }

function isAuthenticated(req, res, next) {
  // console.log("Full session object:", req.session);
  // console.log("Session ID:", req.sessionID);
  // console.log("Is Authenticated:", req.session.isAuthenticated);
  // console.log("User ID:", req.session.userId);

  if (req.session && req.session.isAuthenticated === true) {
    return next();
  }
  return res.status(401).send({ message: "Unauthorized: Please login first." });
}

routes.post("/createaccount", async (req, res) => {
  try {
    const reqBody = req.body;

    if (reqBody.name == "" || reqBody.password == "" || reqBody.email == "") {
      return res.status(400).send({ message: "All field are required" });
    }

    if (!reqBody.name || !reqBody.password || !reqBody.email) {
      return res.status(400).send({ message: "Invalid data" });
    }

    const emailValid = userService.validateEmailFormat(reqBody.email);
    if (!emailValid) {
      return res
        .status(401)
        .send({ status: "failed", message: "Invalid email format" });
    }

    const hashedPassword = await bcrypt.hash(reqBody.password, 10);

    const newUser = {
      name: reqBody.name,
      password: hashedPassword,
      email: reqBody.email,
    };

    const emailCheck = await userService.emailExists(newUser.email);
    const usernameCheck = await userService.validateUsernamme(newUser.name);

    if (emailCheck) {
      return res
        .status(400)
        .send({ message: "Email already exists, try another email" });
    }
    if (usernameCheck) {
      return res
        .status(400)
        .send({ message: "Name already exists, try another name" });
    }

    const result = await user.create(newUser);

    return res.status(200).send({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

routes.post("/login", async (req, res) => {
  try {
    const reqBody = req.body;

    if (reqBody.name == "" || reqBody.password == "" || reqBody.email == "") {
      return res.status(400).send({ message: "All field are required" });
    }

    if (!reqBody.email || !reqBody.password) {
      return res.status(400).send({ message: "Invalid data" });
    }

    // Proses login setelah format email valid
    const result = await userService.Login(reqBody.email, reqBody.password);

    // Cek jika status login gagal
    if (result.status === "failed") {
      return res.status(401).json({ message: result.message });
    }

    // Jika login berhasil, simpan session dan kirim respons sukses
    req.session.name = result.data.name;
    req.session.email = result.data.email;
    req.session.userId = result.data.userId;
    req.session.isAuthenticated = true;

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).send({ message: "Session save failed" });
      }
      console.log("Session after login:", req.session);
      console.log("Session ID after login:", req.sessionID);
      console.log("sesi setelah login : ", req.session);

      return res.status(200).send({
        status: "success",
        message: "User logged in successfully",
        data: {
          isAuthenticated: req.session.isAuthenticated,
          name: req.session.name,
          userId: req.session.userId,
        },
      });
    });
  } catch (error) {
    console.error("Error validating login data:", error);
    return res.status(500).send({ message: "Invalid data" });
  }
});

routes.get("/dashboard", isAuthenticated, (req, res) => {
  console.log("dashboard user id : " + req.session.userId);
  return res.status(200).send({
    message: "User dashboard",
    data: {
      userId: req.session.userId,
      email: req.session.email,
      isAuthenticated: true,
      name: req.session.name,
    },
  });
});

routes.get("/dashboard/logout", isAuthenticated, (req, res) => {
  console.log("Logout request received");
  req.session.isAuthenticated = false;
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send({ message: "Server error" });
    }
    res.clearCookie("connect.sid");
    console.log("Session destroyed successfully");
    console.log("sesi setelah login : ", req.session);
    return res.status(200).send({ message: "User logged out successfully" });
  });
});

routes.delete("/dashboard/delete", isAuthenticated, async (req, res) => {
  try {
    console.log("Delete request received");

    // Ambil userId dari session
    const userId = req.session.userId;
    const fullsession = req.session;
    console.log("Full session: " + JSON.stringify(fullsession));
    console.log("userId: " + userId);

    if (!userId) {
      return res.status(400).send({ message: "Invalid session data" });
    }

    // Hapus user dari database
    const deletedUser = await user.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send({ message: "Server error" });
      }
      res.clearCookie("connect.sid");
      console.log("Session destroyed successfully");
      return res.status(200).send({ message: "User deleted successfully" });
    });

    // req.session.isAuthenticated = false;
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

export default routes;
