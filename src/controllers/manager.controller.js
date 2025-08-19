import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  { Manager }  from "../models/manager.models.js";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/mailer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRoleToken } from "../utils/RoleToken.js";
import { generateEncryptedKey } from "../utils/RoleToken.js";
import { APIError } from "../utils/APIerror.js";

const createManager = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password ) {
    throw new APIError(400, "Email, Password, and name are required");
  }

  const existing = await Manager.findOne({ email });
  if (existing) {
    throw new APIError(409, "Manager with this email already exists");
  }

  const manager = await Manager.create({ email, password, name });

  res.status(201).json({
    success: true,
    message: "Manager created successfully",
    manager: {
      email: manager.email,
      fullName: manager.name,
      role: manager.role,
      avatar: manager.avatar,
      id: manager._id,
    },
  });
});

const loginManager = async (req, res) => {
  const { email, password } = req.body;

  try {
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = manager.generateAccessToken();

   // Generate a JWT token containing the manger's role
    const roleToken = generateRoleToken("manager", process.env.MAN_SUFFIX);

    // Generate a randomized cookie key (prefixed with '002') for storing the role token
    const key = generateEncryptedKey(process.env.MAN_KEY_NAME); // '002'

     const cookiesOption = {
      sameSite: "strict",
      httpOnly: false,
      secure: process.env.NODE_ENV === "development" ? false : true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".indibus.net",
    };
    // Set cookies (can add httpOnly, secure, sameSite as needed)
    return res
      .status(200)
      .cookie("token", token, cookiesOption)
      .cookie(key, roleToken, cookiesOption)
      .json({
        success: true,
        message: "Login successful",
        token,
        manager: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          createdAt: manager.createdAt,
        },
      });
  } catch (error) {
    console.error("Error in loginManager:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "manager not found",
      });
    }

    // generate 6 digit otp
    const otp = generateOtp();
    const expiry = Date.now() + 10 * 60 * 1000;

    manager.otp = otp;
    // set expiry time to 10 minutes from now
    manager.otpExpiry = expiry;
    await manager.save();

    const linkUrl = `${process.env.CLIENT_URL}/reset-password/${manager._id}`;

    // Email content
    // Use a template literal to create the HTML content
    // HTML email content
    const html = `
      <p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>
      <p>You can also reset your password directly using the link below:</p>
      <a href="${linkUrl}" style="display:inline-block;padding:10px 20px;background-color:#007BFF;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
    `;

    // Send the email using the sendEmail utility
    await sendEmail({ to: email, subject: "Password Reset OTP", html });
    res.status(200).json({
      success: true,
      response: {
        message: "OTP sent successfully",
        //otp: otp,                    // Optional: Include OTP in response for testing purposes
      },
      data: {
        managerId: manager._id,
        RedirectUrl: linkUrl,
      },
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
      },
    });
  }
};

// Verify OTP function
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: {
          message: "OTP is required",
        },
      });
    }

    const managerId = req.params.id;
    const manager = await Manager.findById(managerId);

    if (!manager || !manager.otp || !manager.otpExpiry) {
      return res.status(400).json({
        success: false,
        error: {
          message: "OTP not found or expired",
        },
      });
    }

    if (manager.otp !== otp || manager.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid or expired OTP",
        },
      });
    }

    res.status(200).json({
      success: true,
      response: {
        message: "OTP verified successfully",
      },
      data: {
        managerId: manager._id,
      },
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
      },
    });
  }
};

// RRESET PASSWORD function
const resetPASS = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: "New password is required",
        },
      });
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
    }

    const managerId = req.params.id;
    const foundManager = await Manager.findById(managerId).select("+password");

    if (!foundManager) {
      return res.status(404).json({
        success: false,
        error: {
          message: "manager not found",
        },
      });
    }

    const isSamePassword = await foundManager.isPasswordCorrect(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: "New password cannot be the same as the old password",
        },
      });
    }

    foundManager.password = newPassword;
    foundManager.otp = null;
    foundManager.otpExpiry = null;
    await foundManager.save();

    res.status(200).json({
      success: true,
      response: {
        message: "Password reset successfully",
      },
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
      },
    });
  }
};

export {  createManager, loginManager, sendOTP, verifyOTP, resetPASS };