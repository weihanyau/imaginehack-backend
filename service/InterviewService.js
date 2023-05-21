import { Interview } from "../model/interview.js";
import { Interviewee } from "../model/interviewee.js";
import { IntervieweeDetail } from "../model/intervieweeDetail.js";
import fs from "fs";
import uuid4 from "uuid4";
import ffmpeg from "fluent-ffmpeg";
import { SpeechClient } from "@google-cloud/speech";
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

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

  await Interviewee.deleteMany({})
  await IntervieweeDetail.deleteMany({})

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

export async function findAllInterviewDetail(){
  return await IntervieweeDetail.find().exec();
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
  const interviewee = await Interviewee.findById(intervieweeId).exec();

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

      const anomalyForm = new FormData();
      anomalyForm.append("paragraph", transcription);
      const anomalyResponse = await fetch("http://localhost:5000/anomaly", {
        method: "POST",
        body: anomalyForm,
      });

      const anomalyResult = await anomalyResponse.json();

      const summarizeForm = new FormData();
      summarizeForm.append("summarization", transcription);
      const summarizeResponse = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        body: summarizeForm,
      });
      const summarizeResult = await summarizeResponse.json();

      const absPath = path.resolve(targetPath);
      const videoForm = new FormData();
      videoForm.append("video", absPath);
      const videoResponse = await fetch("http://localhost:5000/facial", {
        method: "POST",
        body: videoForm,
      });
      const videoResult = await videoResponse.json();

      const newInterviewDetail = new IntervieweeDetail({
        question: "",
        intervieweeId: intervieweeId,
        videoLink: targetPath,
        transcript: transcription,
        anomaly: anomalyResult.anomaly,
        normal: anomalyResult.normal,
        summary: summarizeResult.summary[0],
        confidence: Number(videoResult.confidence),
        name: interviewee.name
      });

      results = await newInterviewDetail.save();

      resolve();
    });
  });
  return results;
}
