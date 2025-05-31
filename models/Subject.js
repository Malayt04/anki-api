import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});

const SubjectSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  questions: {
    type: [QuestionSchema],
    required: true
  }
});

export default mongoose.model('Subject', SubjectSchema);
