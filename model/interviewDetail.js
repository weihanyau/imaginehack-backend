import mongoose from "mongoose";
import { interviewDetailSchema } from "../schema/interviewDetail.js";

export const InterviewDetail = mongoose.model(
  "InterviewDetail",
  interviewDetailSchema
);
