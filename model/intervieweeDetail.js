import mongoose from "mongoose";
import { intervieweeDetailSchema } from "../schema/intervieweeDetail.js";

export const IntervieweeDetail = mongoose.model(
  "IntervieweeDetail",
  intervieweeDetailSchema
);
