import React from 'react';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const QuestionInput = ({ question, onChange, onDuplicate, onDelete }) => {
  const handleTitleChange = (e) => {
    onChange({ ...question, title: e.target.value });
  };

  const handleTypeChange = (e) => {
    onChange({ ...question, type: e.target.value, options: [] });
  };

  const handleRequiredChange = (e) => {
    onChange({ ...question, required: e.target.checked });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const newOption = { id: Date.now().toString(), text: '' };
    onChange({ ...question, options: [...question.options, newOption] });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: updatedOptions });
  };

  const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(
    question.type
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="card mb-4 border-l-4 border-primary-500 group"
    >
      {/* Drag handle indicator */}
      <div className="flex items-center justify-center mb-3 opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <label className="form-label">Question Title</label>
          <input
            type="text"
            value={question.title}
            onChange={handleTitleChange}
            placeholder="Enter question title"
            className="form-input"
          />
        </div>
        <div className="flex gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDuplicate}
            className="btn-secondary !px-3"
            title="Duplicate question"
          >
            <Copy size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="btn-danger !px-3"
            title="Delete question"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label">Question Type</label>
          <select
            value={question.type}
            onChange={handleTypeChange}
            className="form-input"
          >
            <option value="short_answer">Short Answer</option>
            <option value="paragraph">Paragraph</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="checkboxes">Checkboxes</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer group/toggle">
            <div className="relative">
              <input
                type="checkbox"
                checked={question.required}
                onChange={handleRequiredChange}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${
                question.required ? 'bg-primary-500' : 'bg-gray-300'
              }`}></div>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                question.required ? 'translate-x-5' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-700 font-medium">Required</span>
          </label>
        </div>
      </div>

      {hasOptions && (
        <motion.div layout className="mb-4">
          <label className="form-label">Options</label>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex gap-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="form-input"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveOption(index)}
                  className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddOption}
            className="btn-secondary mt-3 text-sm"
          >
            + Add Option
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionInput;
