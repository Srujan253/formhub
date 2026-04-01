const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'short_answer', 'paragraph', 'multiple_choice', 'radio', 
      'checkboxes', 'dropdown', 'linear_scale', 'file_upload', 
      'grid_choice', 'grid_checkbox', 'layout_block', 'title_section', 'image_section', 'section_break'
    ],
    required: true,
  },
  layoutType: { type: String, enum: ['title_desc', 'image'], default: null },
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