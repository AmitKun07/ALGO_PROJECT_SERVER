import xlsx from "xlsx";
import fs from "fs";
import mongoose from "mongoose";
import Problem from "../models/problem.models.js";
import { User } from "../models/user.models.js";

const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, pattern, companies, platform, link, createdBy } = req.body;

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      pattern,
      companies,
      link,
      platform,
      createdBy: await User.findById(createdBy),
    });

    await newProblem.save();

    res.status(201).json({
      success: true,
      data: newProblem
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const bulkUploadProblems = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        error: { message: req.fileValidationError },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: "No file uploaded" },
      });
    }

    const workbook = xlsx.readFile(req.file.path);

    if (workbook.SheetNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Uploaded file is empty or invalid" },
      });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      totalProcessed++;
      const row = rows[i];

      // ✅ Required fields
      if (!row.title || !row.difficulty) {
        failed++;
        errors.push({
          row: i + 2, // +2 for Excel header + 1-index
          error: "Missing required field: title or difficulty",
        });
        continue;
      }

      try {
        const createdBy =
          row.createdBy && mongoose.Types.ObjectId.isValid(row.createdBy)
            ? await User.findById(row.createdBy)
            : req.user._id; // fallback to current user

        const newProblem = new Problem({
          title: row.title,
          description: row.description || "",
          difficulty: row.difficulty.toLowerCase(),
          pattern: row.pattern || [],
          companies: row.companies || [],
          platform: row.platform || "",
          link: row.link || "",
          createdBy,
        });

        await newProblem.save();
        successful++;
      } catch (err) {
        console.error("Error creating problem:", err);
        failed++;
        errors.push({
          row: i + 2,
          error: "Database error or duplicate entry",
        });
      }
    }

    // delete uploaded file after processing
    fs.unlink(req.file.path, () => {});

    return res.status(201).json({
      success: true,
      response: {
        message: "Problems uploaded successfully!",
      },
      data: {
        totalProcessed,
        successful,
        failed,
        errors,
      },
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal Server error" },
    });
  }
};


const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().populate("createdBy", "name email");
    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id).populate("createdBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};  

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, pattern, companies, link, updatedBy } = req.body;

    const problem = await Problem.findByIdAndUpdate(id, {
      title,
      description,
      difficulty,
      pattern,
      companies,
      link,
      platform,
      updatedBy: await User.findById(updatedBy)
    }, { new: true });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export { createProblem, bulkUploadProblems, getAllProblems, getProblemById, updateProblem, deleteProblem };
