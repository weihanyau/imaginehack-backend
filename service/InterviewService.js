import { Job } from "../model/job.js";
import { Interview } from "../model/interview.js";
import { InterviewDetail } from "../model/interviewDetail.js";

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
