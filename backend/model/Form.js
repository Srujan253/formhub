import mongoose from 'mongoose';
import crypto from 'crypto';

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'short_answer', 'paragraph', 'multiple_choice', 'radio', 
      'checkboxes', 'dropdown', 'linear_scale', 'file_upload', 
      'grid_choice', 'grid_checkbox', 'layout_block',
      'title_section', 'image_section', 'section_break'
    ],
    required: true,
  },
  layoutType: { type: String, enum: ['title_desc', 'image', null], default: null }, // Only for layout_block
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ id: String, text: String }],
  allowOther: { type: Boolean, default: false },
  minScale: { type: Number, default: 1 },
  maxScale: { type: Number, default: 5 },
  minLabel: String,
  maxLabel: String,
  imageUrl: String,
  rows: [String],
  columns: [String],
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  items: [itemSchema]
}, { _id: false });

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, default: '' },
    headerImage: { type: String, default: '' },
    sections: [sectionSchema], // Replaced questions array with sections
    createdBy: { type: String, default: 'anonymous' },
    isActive: {
      type: Boolean,
      default: true,
    },
    shareToken: {
      type: String,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
  },
  { timestamps: true }
);

// Auto-generate shareToken before saving if not present
formSchema.pre('save', function () {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(16).toString('hex');
  }
});

export default mongoose.model('Form', formSchema);
