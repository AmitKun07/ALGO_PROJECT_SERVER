import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app = express();

app.use(
  cors({
    // origin: "https://lead.indibus.net",
    origin: process.env.NODE_ENV === 'production' ? "https://shady.odrly.com" : "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

// Import Routes and State it's Functions in Try Catch Block
import userRouter from "./routes/user.routes.js";
try {
  app.use("/api/v1/user", userRouter);
} catch (error) {
  console.log("File: app.js", "Line 33:", error);
  throw new Error("Error Occured in Routes", error);
}










export default app;
