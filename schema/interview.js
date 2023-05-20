import mongoose from "mongoose";

export const interviewSchema = new mongoose.Schema({
  name: String,
  questions: [String],
});
