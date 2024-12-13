import express from "express";
import Admin from "../models/admin.js";
import AccountValidation from "../validation/AccountValidation.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";

import dotenv from "dotenv";
dotenv.config();

const routes = express.Router();
const adminService = new AccountValidation(Admin);

routes.use(
  session({
    secret: process.env.ADMIN_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collection: "adminSessions",
      ttl: 90 * 24 * 60 * 60, // expires after 14 day
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // expires after 14 days
      httpOnly: true,
      secure: false,
    },
  })
);

function isAuthenticated(req, res, next) {
  console.log("Session ID:", req.session.isAuthenticated); // Debugging session
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).send({ message: "Unauthorized: Please login first." });
}

routes.post("/createadmin", async (req, res) => {
  try {
    const reqBody = req.body;

    if (!reqBody.name || !reqBody.password || !reqBody.email) {
      return res.status(400).send({ message: "Invalid data" });
    }

    const emailValid = adminService.validateEmailFormat(reqBody.email);
    if (!emailValid) {
      return res
        .status(401)
        .send({ status: "failed", message: "Invalid email format" });
    }

    const hashedPassword = await bcrypt.hash(reqBody.password, 10);

    const newAdmin = {
      name: reqBody.name,
      password: hashedPassword,
      email: reqBody.email,
    };

    const emailCheck = await adminService.emailExists(newAdmin.email);
    const usernameCheck = await adminService.validateUsernamme(newAdmin.name);

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

    const result = await Admin.create(newAdmin);

    return res.status(200).send({
      status: "success",
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

routes.post("/login", async (req, res) => {
  try {
    const reqBody = req.body;

    if (!reqBody.email || !reqBody.password) {
      return res.status(400).send({ message: "Invalid datas" });
    }

    // Validasi format email
    if (!adminService.validateEmailFormat(reqBody.email)) {
      return res.status(400).send({ message: "Invalid email format" });
    }

    const result = await adminService.Login(reqBody.email, reqBody.password);

    if (result.status === "failed") {
      return res.status(401).send({ message: result.message });
    }

    req.session.email = result.email;
    req.session.adminId = result._id;
    req.session.isAuthenticated = true; // Additional session data for authentication
    // req.session.expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // expires after 14 days
    console.log(
      "Session created successfully with userId:",
      req.session.userId
    );

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).send({ message: "Session save failed" });
      }
      console.log(
        "Session saved successfully with userId:",
        req.session.userId
      );
      return res.status(200).send({
        status: "success",
        message: "user logged in successfully",
      });
    });
  } catch (error) {
    console.error("Error validating login data:", error);
    return res.status(500).send({ message: "Invalid data" });
  }
});

routes.get("/dashboard", isAuthenticated, (req, res) => {
  console.log("Admin ID:", req.session.adminId); // Debugging session
  return res.status(200).send({ message: "Welcome to the admin dashboard" });
});

routes.get("/dashboard/logout", isAuthenticated, (req, res) => {
  console.log("Logout request received");
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send({ message: "Server error" });
    }
    res.clearCookie("connect.sid");
    console.log("Session destroyed successfully");
    return res.status(200).send({ message: "User logged out successfully" });
  });
});

routes.delete("/dashboard/delete", isAuthenticated, async (req, res) => {
  try {
    console.log("Delete request received");

    // Ambil userId dari session
    const adminId = req.session.adminId;
    const fullsession = req.session;
    console.log("Full session: " + send.stringify(fullsession));
    console.log("userId: " + adminId);

    if (!adminId) {
      return res.status(400).send({ message: "Invalid session data" });
    }

    // Hapus user dari database
    const deletedUser = await Admin.findByIdAndDelete(adminId);

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
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

export default routes;
