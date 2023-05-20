import mongoose from "mongoose";

export const intervieweeDetailSchema = new mongoose.Schema({
  question: String,
  intervieweeId: String,
  videoLink: { type: String, default: null },
  transcript: String,
});
