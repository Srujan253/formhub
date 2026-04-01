import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuestionPreview = ({ question, answer, onChange, errors }) => {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [localAnswers, setLocalAnswers] = useState(
    Array.isArray(answer) ? answer : []
  );

  const handleTextChange = (e) => {
    setLocalAnswer(e.target.value);
    onChange(question.id, e.target.value);
  };

  const handleCheckboxChange = (optionText) => {
    let updated;
    if (localAnswers.includes(optionText)) {
      updated = localAnswers.filter((a) => a !== optionText);
    } else {
      updated = [...localAnswers, optionText];
    }
    setLocalAnswers(updated);
    onChange(question.id, updated);
  };

  const handleSelectChange = (e) => {
    setLocalAnswer(e.target.value);
    onChange(question.id, e.target.value);
  };

  const questionLabel = question.required ? (
    <>
      {question.title}
      <span className="text-red-400 ml-1">*</span>
    </>
  ) : (
    question.title
  );

  const isError = errors && errors[question.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card mb-4 border-l-4 transition-all duration-300 ${
        isError
          ? 'border-red-400 bg-red-50/40 shadow-md shadow-red-100/50'
          : 'border-primary-400'
      }`}
    >
      <label className={`form-label text-base ${isError ? 'text-red-600' : 'text-gray-800'}`}>
        {questionLabel}
      </label>

      {question.type === 'short_answer' && (
        <input
          type="text"
          value={localAnswer}
          onChange={handleTextChange}
          placeholder="Your answer"
          className={`form-input ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        />
      )}

      {question.type === 'paragraph' && (
        <textarea
          value={localAnswer}
          onChange={handleTextChange}
          placeholder="Your answer"
          rows="4"
          className={`form-input resize-none ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        />
      )}

      {question.type === 'multiple_choice' && (
        <div className="space-y-2 mt-1">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                localAnswer === option.text
                  ? 'bg-primary-50/80 border-primary-200 shadow-sm'
                  : 'bg-white/60 border-gray-100 hover:bg-gray-50/80'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.text}
                checked={localAnswer === option.text}
                onChange={handleTextChange}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-400"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium">{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'checkboxes' && (
        <div className="space-y-2 mt-1">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                localAnswers.includes(option.text)
                  ? 'bg-primary-50/80 border-primary-200 shadow-sm'
                  : 'bg-white/60 border-gray-100 hover:bg-gray-50/80'
              }`}
            >
              <input
                type="checkbox"
                checked={localAnswers.includes(option.text)}
                onChange={() => handleCheckboxChange(option.text)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-400"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium">{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'dropdown' && (
        <select
          value={localAnswer}
          onChange={handleSelectChange}
          className={`form-input ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.text}>
              {option.text}
            </option>
          ))}
        </select>
      )}

      {isError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-2 font-medium"
        >
          This field is required
        </motion.p>
      )}
    </motion.div>
  );
};

export default QuestionPreview;
