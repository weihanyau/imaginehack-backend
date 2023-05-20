import mongoose from "mongoose";
import { intervieweeSchema } from "../schema/interviewee.js";

export const Interviewee = mongoose.model("Interviewee", intervieweeSchema);
