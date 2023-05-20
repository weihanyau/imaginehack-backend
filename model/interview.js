import mongoose from "mongoose";
import { interviewSchema } from "../schema/interview.js";

export const Interview = mongoose.model("Interview", interviewSchema);
