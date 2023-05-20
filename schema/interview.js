import mongoose from "mongoose";

export const interviewSchema = new mongoose.Schema({
  name: String,
  jobId: String,
  started: { type: Boolean, default: false },
});
