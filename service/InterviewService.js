import { Interview } from "../model/interview.js";
import { Interviewee } from "../model/interviewee.js";
import { IntervieweeDetail } from "../model/intervieweeDetail.js";
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

export async function createInterview(interviewName, questions) {
  const currInterview = await Interview.findById(
    "64690fef7e09492a14acfe14"
  ).exec();

  return await currInterview
    .updateOne({
      name: interviewName,
      questions: questions,
    })
    .exec();
}

export async function findInterviewById(interviewId) {
  return await Interview.findById(interviewId).exec();
}

export async function applyInterview(name, interviewId) {
  const newInterviewee = new Interviewee({
    name: name,
    interviewId: interviewId,
  });

  return await newInterviewee.save();
}

export async function findAllIntervieweeByInterviewId(interviewId) {
  return await Interviewee.find({
    interviewId: interviewId,
  }).exec();
}

export async function findIntervieweeById(interviweeId) {
  return await Interviewee.findById(interviweeId).exec();
}

export async function findIntervieweeDetailsByIntervieweeId(intervieweeId) {
  return await IntervieweeDetail.find({ intervieweeId: intervieweeId }).exec();
}

export async function submitVideo(question, file, intervieweeId) {
  const tempPath = file.path;
  const fileName = uuid4();
  const targetPath = `./upload/${fileName}.webm`;
  const audioOutputPath = `./upload/${fileName}.mp3`;

  let results = "err";

  await new Promise((resolve, reject) => {
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

      const newInterviewDetail = new IntervieweeDetail({
        question: "",
        intervieweeId: intervieweeId,
        videoLink: targetPath,
        transcript: transcription,
      });

      results = await newInterviewDetail.save();

      resolve();
    });
  });
  return results;
}
