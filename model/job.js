import mongoose from "mongoose";
import { jobSchema } from "../schema/job.js";

export const Job = mongoose.model("Job", jobSchema);
