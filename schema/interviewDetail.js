import mongoose from "mongoose";

export const interviewDetailSchema = new mongoose.Schema({
  question: String,
  interviewId: String,
  videoLink: { type: String, default: null },
});
