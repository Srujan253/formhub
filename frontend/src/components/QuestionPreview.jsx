import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, File } from 'lucide-react';
import DOMPurify from 'dompurify';
import { cloudinaryAPI } from '../services/api';

const QuestionPreview = ({ question, answer, onChange, errors, onViewFile }) => {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [localAnswers, setLocalAnswers] = useState(
    Array.isArray(answer) ? answer : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const isLayoutBlock = question.type === 'layout_block';

  const handleTextChange = (e) => {
    setLocalAnswer(e.target.value);
    onChange(question.id, e.target.value);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB just as an example, user wanted 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    try {
      const response = await cloudinaryAPI.uploadImage(file);
      // The backend returns { success: true, url: ... } or { url: ... }
      const fileUrl = response.url || response.secure_url;
      if (fileUrl) {
         setLocalAnswer(fileUrl);
         onChange(question.id, fileUrl);
      } else {
         setUploadError('Upload failed: Invalid response from server');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setLocalAnswer('');
    onChange(question.id, '');
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

  const isError = errors && errors[question.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 transition-all duration-300 ${
        isLayoutBlock ? 'py-4 px-2' : `card border-l-4 ${
          isError
            ? 'border-red-400 bg-red-50/40 shadow-md shadow-red-100/50'
            : 'border-primary-400'
        }`
      }`}
    >
      <div className={`${isLayoutBlock ? 'mb-2' : 'form-label text-base mb-4'} ${isError ? 'text-red-600' : 'text-gray-800'}`}>
        <div className="flex items-start">
          <div 
            className={`prose prose-sm max-w-none break-words ${isLayoutBlock ? 'prose-h1:text-2xl prose-h2:text-xl' : ''}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }}
          />
          {!isLayoutBlock && question.required && <span className="text-red-400 ml-1 mt-1">*</span>}
        </div>
      </div>

{question.description && (
        <div
          className="prose prose-sm max-w-none text-gray-500 font-normal leading-relaxed mb-4 break-words"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.description) }}
        />
      )}

      {/* Render media attached to layout blocks */}
      {isLayoutBlock && question.layoutType === 'image' && question.mediaUrl && (
         <div className="mt-4">
           <img src={question.mediaUrl} alt="Layout" className="w-full h-auto rounded-2xl mx-auto" />
         </div>
      )}

      {/* Render media attached to normal questions */}
      {!isLayoutBlock && question.mediaUrl && (
        <div className="mt-4 mb-4">
          {question.mediaType === 'pdf' ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl max-w-fit">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col pr-8">
                <span className="text-sm font-semibold text-gray-700">Attached Document</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewFile) {
                      onViewFile(question.mediaUrl);
                    } else {
                      window.open(question.mediaUrl, '_blank');
                    }
                  }}
                  className="text-xs text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 mt-0.5 text-left"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <img src={question.mediaUrl} alt="Question Attachment" className="max-w-full h-auto max-h-[400px] object-contain rounded-xl border border-gray-100" />
          )}
        </div>
      )}

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

      {(question.type === 'multiple_choice' || question.type === 'radio') && (
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
          {question.allowOther && (
            <div className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
              localAnswer !== '' && !question.options.some(o => o.text === localAnswer)
                ? 'bg-primary-50/80 border-primary-200 shadow-sm'
                : 'bg-white/60 border-gray-100'
            }`}>
              <input
                type="radio"
                name={question.id}
                value="other"
                checked={localAnswer !== '' && !question.options.some(o => o.text === localAnswer)}
                onChange={() => setLocalAnswer('')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-400"
              />
              <span className="ml-3 text-sm text-gray-400 font-medium">Other:</span>
              <input
                type="text"
                placeholder="Custom answer"
                className="ml-2 flex-1 bg-transparent border-b border-gray-200 focus:border-primary-400 outline-none p-0.5 text-sm"
                value={(!question.options.some(o => o.text === localAnswer) ? localAnswer : '')}
                onChange={(e) => handleTextChange(e)}
              />
            </div>
          )}
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
          {question.allowOther && (
            <div className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
              localAnswers.some(a => !question.options.some(o => o.text === a))
                ? 'bg-primary-50/80 border-primary-200 shadow-sm'
                : 'bg-white/60 border-gray-100'
            }`}>
              <input
                type="checkbox"
                checked={localAnswers.some(a => !question.options.some(o => o.text === a))}
                onChange={(e) => {
                  if (!e.target.checked) {
                    // Remove the "Other" value
                    const updated = localAnswers.filter(a => question.options.some(o => o.text === a));
                    setLocalAnswers(updated);
                    onChange(question.id, updated);
                  }
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-400"
              />
              <span className="ml-3 text-sm text-gray-400 font-medium">Other:</span>
              <input
                type="text"
                placeholder="Custom answer"
                className="ml-2 flex-1 bg-transparent border-b border-gray-200 focus:border-primary-400 outline-none p-0.5 text-sm"
                value={localAnswers.find(a => !question.options.some(o => o.text === a)) || ''}
                onChange={(e) => {
                  const otherVal = e.target.value;
                  const baseAnswers = localAnswers.filter(a => question.options.some(o => o.text === a));
                  const updated = otherVal ? [...baseAnswers, otherVal] : baseAnswers;
                  setLocalAnswers(updated);
                  onChange(question.id, updated);
                }}
              />
            </div>
          )}
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

      {question.type === 'linear_scale' && (
        <div className="mt-4 px-2">
          <div className="flex justify-between items-end mb-3 px-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>{question.minLabel || question.minScale}</span>
            <span>{question.maxLabel || question.maxScale}</span>
          </div>
          <div className="flex justify-between gap-1">
            {Array.from(
              { length: question.maxScale - question.minScale + 1 },
              (_, i) => question.minScale + i
            ).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectChange({ target: { value: val } })}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 border ${
                  Number(localAnswer) === val
                    ? 'bg-primary-500 border-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-bold">{val}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {question.type === 'image_section' && question.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 rounded-2xl overflow-hidden border border-gray-100 shadow-glass"
        >
          <img src={question.imageUrl} alt={question.title} className="w-full h-auto max-h-[500px] object-contain bg-gray-50" />
        </motion.div>
      )}

      {(question.type === 'grid_choice' || question.type === 'grid_checkbox') && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest"></th>
                {question.columns?.map((col, i) => (
                  <th key={i} className="p-3 text-center text-xs font-bold text-gray-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.rows?.map((row, rowIdx) => (
                <tr key={rowIdx} className="bg-white/40 backdrop-blur-sm rounded-xl border border-gray-100 hover:bg-white/60 transition-colors">
                  <td className="p-3 text-sm font-semibold text-gray-700 whitespace-nowrap border-l border-t border-b border-gray-50 rounded-l-xl">
                    {row}
                  </td>
                  {question.columns?.map((col, colIdx) => {
                    const cellKey = `${rowIdx}-${colIdx}`;
                    const isChecked = question.type === 'grid_checkbox'
                      ? (localAnswer?.[row] || []).includes(col)
                      : localAnswer?.[row] === col;

                    return (
                      <td key={colIdx} className="p-3 text-center border-t border-b border-gray-50">
                        <input
                          type={question.type === 'grid_choice' ? 'radio' : 'checkbox'}
                          name={`${question.id}-${rowIdx}`}
                          checked={isChecked}
                          onChange={(e) => {
                            let newAnswer = { ...(localAnswer || {}) };
                            if (question.type === 'grid_checkbox') {
                              const currentVal = newAnswer[row] || [];
                              newAnswer[row] = e.target.checked
                                ? [...currentVal, col]
                                : currentVal.filter(c => c !== col);
                            } else {
                              newAnswer[row] = col;
                            }
                            setLocalAnswer(newAnswer);
                            onChange(question.id, newAnswer);
                          }}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-400 border-gray-300 transition-all"
                        />
                      </td>
                    );
                  })}
                  <td className="border-r border-t border-b border-gray-50 rounded-r-xl"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {question.type === 'section_break' && (
        <div className="my-10 border-t-2 border-dashed border-gray-200 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-white text-gray-400 font-bold text-xs uppercase tracking-widest">
            Next Section
          </div>
        </div>
      )}

      {question.type === 'file_upload' && (
        <div className="mt-4">
          {!localAnswer ? (
             <div className="w-full relative">
               <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
                 isError ? 'border-red-300 bg-red-50/20' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
               }`}>
                 <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                   {uploading ? (
                     <>
                       <div className="w-8 h-8 mb-2 rounded-full border-[3px] border-primary-100 border-t-primary-500 animate-spin"></div>
                       <p className="mb-1 text-sm text-primary-600 font-medium">Uploading...</p>
                     </>
                   ) : (
                     <>
                       <Upload className={`w-8 h-8 mb-2 transition-colors ${isError ? 'text-red-300 group-hover:text-red-400' : 'text-gray-400 group-hover:text-primary-500'}`} />
                       <p className={`mb-1 text-sm font-medium ${isError ? 'text-red-500' : 'text-gray-500'}`}>Click to upload or drag and drop</p>
                       <p className="text-xs text-gray-400">PDF, IMAGE, or DOCX (Max 10MB)</p>
                     </>
                   )}
                 </div>
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*,.pdf,.doc,.docx" 
                   onChange={handleFileUpload}
                   disabled={uploading}
                 />
               </label>
               {uploadError && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded">{uploadError}</p>}
             </div>
          ) : (
             <div className="relative group p-4 border border-gray-200 rounded-xl bg-white max-w-sm flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4 overflow-hidden">
                 {localAnswer.includes('/image/upload') || localAnswer.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                   <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                     <img src={localAnswer} alt="Preview" className="max-w-full max-h-full object-cover" />
                   </div>
                 ) : (
                   <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg shrink-0 border border-primary-100/50">
                     {localAnswer.toLowerCase().endsWith('.pdf') ? <FileText size={24} /> : <File size={24} />}
                   </div>
                 )}
                 <div className="flex flex-col min-w-0">
                   <p className="text-sm font-semibold text-gray-800 truncate" title={localAnswer.split('/').pop()}>
                     {localAnswer.split('/').pop().substring(0, 20)}...
                   </p>
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       if (onViewFile) {
                         onViewFile(localAnswer);
                       } else {
                         window.open(localAnswer, '_blank');
                       }
                     }}
                     className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 mt-1 hover:underline text-left"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                       <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                     </svg>
                     Click to View
                   </button>
                 </div>
               </div>
               <button 
                 type="button" 
                 onClick={removeFile}
                 className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors ml-2 shrink-0"
                 title="Remove file"
               >
                 <X size={18} />
               </button>
             </div>
          )}
        </div>
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
