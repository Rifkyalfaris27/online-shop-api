import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connection from "./src/db/connection.js";
import ProductRoutes from "./src/routes/product.js";
import UserRoutes from "./src/routes/user.js";
import AdminRoutes from "./src/routes/admin.js";
import ChartRoutes from "./src/routes/chart.js";

import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   })
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collection: "sessions",
      autoRemove: "interval",
      autoRemoveInterval: 10,
      ttl: 14 * 24 * 60 * 60, // expires after 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // expires after 14 days
      httpOnly: false, // secure: true if using HTTPS
      secure: true, // change to true if using https
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello, Worlsd!");
});

app.use("/api", ProductRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/chart", ChartRoutes);

const port = process.env.PORT || 4000;

const server = async () => {
  try {
    await connection();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

server();

export default app
