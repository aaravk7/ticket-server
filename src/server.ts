import express from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import admin from "./routes/admin";
import api from "./routes/api";

dotenv.config();
const app = express();
app.set("view engine", "ejs");
app.use(
  cors({
    origin: "http://0.0.0.0:3000",
  })
);

//Connect DB
connect("mongodb://0.0.0.0:27017/ticket-booking").catch((error) =>
  console.error(error)
);

//Setup express
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", admin);
app.use("/api", api);

const port = process.env.SERVER_PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
