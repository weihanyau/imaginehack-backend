import mongoose from "mongoose";

export const intervieweeSchema = new mongoose.Schema({
  name: String,
  interviewId: String,
});
