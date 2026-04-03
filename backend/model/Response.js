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
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    respondentName: {
      type: String,
      default: '',
      trim: true,
    },
    respondentEmail: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Response', responseSchema);
