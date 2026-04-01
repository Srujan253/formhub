import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          required: true,
        },
        value: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
      },
    ],
    respondentEmail: {
      type: String,
      default: 'anonymous',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Response', responseSchema);
