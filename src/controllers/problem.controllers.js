import Problem from "../models/problem.models.js";
import { User } from "../models/user.models.js";

const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, pattern, companies, link, createdBy } = req.body;

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      pattern,
      companies,
      link,
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

export { createProblem, getAllProblems , getProblemById , updateProblem , deleteProblem };
