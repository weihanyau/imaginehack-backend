import { Job } from "../model/job.js";
import { Interview } from "../model/interview.js";
import { InterviewDetail } from "../model/interviewDetail.js";
import path from "path";
import fs from "fs";
import uuid4 from "uuid4";
import ffmpeg from "fluent-ffmpeg";
import { SpeechClient } from "@google-cloud/speech";
import * as dotenv from "dotenv";

dotenv.config();

const client = new SpeechClient();
const model = "video";
const encoding = "MP3";
const sampleRateHertz = 16000;
const languageCode = "en-US";

const config = {
  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  languageCode: languageCode,
  model: model,
};

export async function createJob(jobName) {
  const newJob = new Job({ name: jobName });
  return await newJob.save();
}

export async function createInterview(name, jobId, questions) {
  const newInterview = new Interview({
    name: name,
    jobId: jobId,
  });

  questions.forEach(async (question) => {
    await new InterviewDetail({
      question: question,
      interviewId: newInterview._id,
    }).save();
  });

  return await newInterview.save();
}

export async function startInterview(interviewId) {
  const startedInterview = await Interview.findByIdAndUpdate(
    interviewId,
    {
      $set: {
        started: true,
      },
    },
    { new: true }
  ).exec();

  return startedInterview;
}

export async function submitVideo(file) {
  const tempPath = file.path;
  const fileName = uuid4();
  const targetPath = `./upload/${fileName}.mp4`;
  const audioOutputPath = `./upload/${fileName}.mp3`;

  await new Promise((resolve, reject) => {
    if (path.extname(file.originalname).toLowerCase() === ".mp4") {
      fs.rename(tempPath, targetPath, async (err) => {
        if (err) throw Error(err);

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(targetPath)
            .toFormat("mp3")
            .saveToFile(audioOutputPath)
            .on("end", () => {
              resolve();
            })
            .on("error", (err) => {
              return reject(new Error(err));
            });
        });

        const [response] = await client.recognize({
          config: config,
          audio: {
            content: fs.readFileSync(audioOutputPath).toString("base64"),
          },
        });

        const transcription = response.results
          .map((result) => {
            return result.alternatives[0].transcript;
          })
          .join("\n");

        resolve();
      });
    } else {
      fs.unlink(tempPath, (err) => {
        if (err) return reject(Error(err));
      });
    }
  });
  return "success";
}
