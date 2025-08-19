import  express  from "express";
// import Problem from "../models/problem.models.js";
import { createProblem ,bulkUploadProblems, getAllProblems , getProblemById , updateProblem , deleteProblem} from "../controllers/problem.controllers.js"

const problemRouter = express.Router();

problemRouter.post(
  "/createProblem",createProblem);

  problemRouter.post(
    "/bulkUploadProblems",
    bulkUploadProblems
  );

problemRouter.get(
  "/getAllProblems", getAllProblems
);

problemRouter.get(
  "/getProblemById/:id", getProblemById
);

problemRouter.put(
  "/updateProblem/:id", updateProblem
);

problemRouter.delete(
  "/deleteProblem/:id", deleteProblem
);

export default problemRouter;