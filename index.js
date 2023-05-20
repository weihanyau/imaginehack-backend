import express from "express";
import mongoose from "mongoose";
import {
  applyInterview,
  createInterview,
  findAllIntervieweeByInterviewId,
  findIntervieweeById,
  findIntervieweeDetailsByIntervieweeId,
  submitVideo,
} from "./service/InterviewService.js";
import bodyParser from "body-parser";
import multer from "multer";
import uuid4 from "uuid4";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3000;

const upload = multer({ dest: "/upload" });

const whitelist = ["http://localhost:3001", "http://localhost:3000"];

const corsOptions = {
  origin: whitelist,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

main().catch((err) => console.log(err));

app.get("/", (req, res) => {
  console.log(uuid4());
  res.send("Hello World!");
});

app.get("/interview/:interviewId/interviewee", async (req, res) => {
  const interviewId = req.params.interviewId;
  const interviewees = await findAllIntervieweeByInterviewId(interviewId);
  res.send(interviewees);
});

app.get("/interviewee/:intervieweeId", async (req, res) => {
  const intervieweeId = req.params.intervieweeId;
  const interviewees = await findIntervieweeById(intervieweeId);
  res.send(interviewees);
});

app.get("/interviewee/:intervieweeId/details", async (req, res) => {
  const intervieweeId = req.params.intervieweeId;
  const interviewDetails = await findIntervieweeDetailsByIntervieweeId(
    intervieweeId
  );
  res.send(interviewDetails);
});

app.post("/interview", async (req, res) => {
  const interviewName = req.body.name;
  const questions = req.body.questions;
  const newJob = await createInterview(interviewName, questions);
  res.send(newJob);
});

app.post("/apply", async (req, res) => {
  const intervieweeName = req.body.name;
  const interviewId = req.body.interviewId;

  const newInterview = await applyInterview(intervieweeName, interviewId);

  res.send(newInterview);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const videoFile = req.file;
  const intervieweeId = req.body.intervieweeId;

  try {
    const result = await submitVideo(videoFile, intervieweeId);
    if (result !== "err") {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ message: "Oops! Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/umisone");
}
