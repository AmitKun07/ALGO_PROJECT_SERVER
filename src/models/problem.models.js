import mongoose, { Schema } from "mongoose";

const problemSchema = new Schema({
  title: { 
    type: String,
    required: true },
  description: { 
    type: String
 },
  difficulty: { 
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true },
  pattern: [{
    type: String,
    required: true
  }],
  companies: [{
    type: String,
  }],
  link: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["new", "attempting", "attempted"],
    default: "new"
  },
  solution: {
    type: String,
  },
  favourite: {
    type: Boolean,
    default: false
  },
  createdBy: {
     type: Schema.Types.ObjectId,
     ref: "User"
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

},  { timestamps: true });

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
