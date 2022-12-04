import express from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import admin from "./routes/admin";

dotenv.config();
const app = express();
app.set("view engine", "ejs");
app.use(
  cors({
    origin: "http://0.0.0.0:3000",
  })
);

//Connect DB
connect(process.env.MONGO_URI).catch((error) => console.error(error));

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

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
