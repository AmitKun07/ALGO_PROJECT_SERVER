import express from "express";
import {
  loginManager,
  createManager
} from "../controllers/manager.controller.js";
// import {  } from "../controllers/currentUser.controller.js";
// import authorizeRoles from "../middlewares/authorizeRoles.middleware.js";
// import checkAuth from "../middlewares/checkAuth.middleware.js";
// import { loginManager } from "../controllers/manager.controller.js";

const managerRouter = express.Router();

managerRouter.post("/login", loginManager);
managerRouter.post("/create", createManager);


export default managerRouter;
