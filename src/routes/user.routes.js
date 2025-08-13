import { Router } from "express";
import { registerUser,loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router() 

//user Auth operations

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    }
]),registerUser)
router.route("/login/gi").post(loginUser)

//user crud operations 


export default router 
