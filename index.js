import express from "express";
import mongoose from "mongoose";
import {
  createInterview,
  createJob,
  startInterview,
  submitVideo,
} from "./service/InterviewService.js";
import bodyParser from "body-parser";
import multer from "multer";
import uuid4 from "uuid4";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const upload = multer({ dest: "/upload" });

app.use(bodyParser.json());

main().catch((err) => console.log(err));

app.get("/", (req, res) => {
  console.log(uuid4());
  res.send("Hello World!");
});

app.post("/job", async (req, res) => {
  const jobName = req.body.name;
  const newJob = await createJob(jobName);
  res.send(newJob);
});

app.post("/interview", async (req, res) => {
  const interviewName = req.body.name;
  const jobId = req.body.jobId;
  const questions = req.body.questions;

  const newInterview = await createInterview(interviewName, jobId, questions);

  res.send(newInterview);
});

app.post("/interview/:id/start", async (req, res) => {
  const interviewId = req.params.id;

  const startedInterview = await startInterview(interviewId);
  return res.send(startedInterview);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const videoFile = req.file;
  try {
    const result = await submitVideo(videoFile);
    if (result === "success") {
      res.status(200).contentType("text/plain").end("File uploaded!");
    }
  } catch (err) {
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  }
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/umisone");
}
