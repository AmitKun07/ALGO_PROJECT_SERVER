// import { Token } from "../models/tokens.models.js";
import { User } from "../models/user.models.js";
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v4 as uuid } from "uuid";
import { Token } from "../models/tokens.model.js";

const generateAccessTokenInstance = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    return { accessToken };
  } catch (error) {
    throw new APIError(
      500,
      "Something Went wrong while generating access and refresh Token"
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "All fields are required",
        },
      });
    }
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User already exists",
        },
      });
    }

    const createdUser = await User.create({
      name,
      email,
      password,
    });

    const token = createdUser.generateAccessToken();

    return res
      .status(201)
      .cookie("token", token)
      .json({
        success: true,
        response: {
          message: "User created successfully!",
        },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal Server error",
      },
    });
  }
};
/*
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name,  email, password } = req.body;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    //check for all fields
    if (
      [name, email, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new APIError(400, "No Empty Field is allowed");
    }

    //check if user already exists

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new APIError(400, "User already exists");
    }

    //upload the avatar on cloudinary
    let avatarLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
    ) {
      avatarLocalPath = req.files.avatar[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
console.log("avatarLocalPath:", avatarLocalPath);

    //generate uuid for user
    const uuidString = uuid();

    //create the user
    const createdUser = await User.create({
      name,
      email,
      password,
      avatar: avatar?.url || "",
    });

    //generate access token
    const { accessToken } = await generateAccessTokenInstance(createdUser._id);
    // create a token for the user
    const createdToken = await Token.create({
      accessToken: accessToken,
      uuid: uuidString,
      latestipaddress: ip,
      ipaddresses: [
        {
          ipaddress: ip,
        },
      ],
    });
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(201)
      .cookie("token", createdToken.uuid, options)
      .json(
        new APIresponse(
          201,
          {
            token: createdToken.uuid,
          },
          "User Created Successfully"
        )
      );
  } catch (error) {
    console.log("File: user.controller.js", "Line 15:", error);
    throw new APIError(500, "Something went wrong while registering the user");
  }
});  */

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email-", email);
    const cleanedEmail = email.replace(/s+/g, ""); // removes all whitespace
    console.log("Cleaned Email:", cleanedEmail);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    //check for all fields
    if ([email, password].some((field) => field?.trim() === "")) {
      throw new APIError(400, "No Empty Field is allowed");
    }

    //check if user exists or not

    const user = await User.findOne({ email: cleanedEmail });
    if (!user) {
      throw new APIError(400, "User does not exists");
    }
    //check if Password is correct ot not
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new APIError(400, "Password is incorrect");
    }

    const generatedToken = await generateAccessTokenInstance(user._id);
    //create a token for the user
    const createdToken = await Token.create({
      accessToken: generatedToken.accessToken,
      uuid: uuid(),
      latestipaddress: ip,
      ipaddresses: [
        {
          ipaddress: ip,
        },
      ],
    });
    const tokenUUID = createdToken.uuid;

    const options = {
      httpOnly: true,
      secure: true,
    };
   return res
  .status(200)
  .cookie("token", tokenUUID, options)
  .json({
    success: true,
    message: "Login successful",
    token: tokenUUID,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });

  //  return res
  // .status(200)
  // .cookie("token", tokenUUID, options)
  // .json(
  //   new APIresponse(
  //     200,
  //     { token: createdToken.uuid }, // <-- keep inside data
  //     "User Logged In Successfully"
  //   )
  // );
  } catch (error) {
    console.log("File: user.controller.js", "Line 99:", error);
    throw new APIError(500, "Something went wrong while logging in the user");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
  } catch (error) {}
});
export { registerUser, loginUser };
