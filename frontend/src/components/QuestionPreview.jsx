import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, X, FileText, File } from 'lucide-react';
import DOMPurify from 'dompurify';
import { cloudinaryAPI } from '../services/api';

const QuestionPreview = ({ question, answer, onChange, errors, onViewFile, confirmationMode = false }) => {
  const { t } = useTranslation();
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [localAnswers, setLocalAnswers] = useState(
    Array.isArray(answer) ? answer : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isLayoutBlock = question.type === 'layout_block';
  const canEdit = confirmationMode && !isLayoutBlock && !['section_break', 'image_section'].includes(question.type);

  useEffect(() => {
    if (!confirmationMode && isEditing) {
      setIsEditing(false);
    }
  }, [confirmationMode, isEditing]);

  const isReadOnly = confirmationMode && !isEditing;
  const readOnlyInputClass = isReadOnly ? 'pointer-events-none opacity-40' : '';
  const mutedTextClass = isReadOnly ? 'text-slate-500' : 'text-gray-800';
  const mutedSubtextClass = isReadOnly ? 'text-slate-500' : 'text-gray-500';
  const optionTextClass = isReadOnly ? 'text-slate-500' : 'text-gray-700';
  const optionMutedTextClass = isReadOnly ? 'text-slate-500' : 'text-gray-400';
  const activeOptionClass = isReadOnly
    ? 'bg-slate-200/70 border-slate-200 shadow-none'
    : 'bg-primary-50/80 border-primary-200 shadow-sm';
  const inactiveOptionClass = isReadOnly
    ? 'bg-slate-50/60 border-slate-200/60'
    : 'bg-white/60 border-gray-100 hover:bg-gray-50/80';
  const activeScaleClass = isReadOnly
    ? 'bg-slate-200/80 border-slate-200 text-slate-700 shadow-none'
    : 'bg-primary-500 border-primary-600 text-white shadow-md shadow-primary-500/30';
  const inactiveScaleClass = isReadOnly
    ? 'bg-slate-50/60 border-slate-200/60 text-slate-500'
    : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-gray-50';

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
      onClick={() => {
        if (canEdit && !isEditing) {
          setIsEditing(true);
        }
      }}
      className={`mb-4 transition-all duration-300 ${
        isLayoutBlock && question.layoutType === 'title_desc' 
          ? `py-6 px-6 border rounded-2xl shadow-sm text-center ${
              isReadOnly ? 'bg-slate-50/60 border-slate-200/70 grayscale-[0.15]' : 'bg-white border-gray-100'
            }` 
          : isLayoutBlock 
            ? `py-4 px-2 ${isReadOnly ? 'grayscale-[0.15]' : ''}` 
            : `card border-l-4 ${isReadOnly ? 'bg-slate-50/60 border-slate-200/70 grayscale-[0.15]' : ''} ${
                isError
                  ? 'border-red-400 bg-red-50/40 shadow-md shadow-red-100/50'
                  : 'border-primary-400'
              }`
      } ${isReadOnly && canEdit ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`${isLayoutBlock ? 'mb-2' : 'form-label text-base mb-4'} ${
          isError ? 'text-red-600' : mutedTextClass
        }`}
      >
        <div className={`flex items-start ${isLayoutBlock && question.layoutType === 'title_desc' ? 'justify-center text-center' : ''}`}>
          <div 
            className={`prose prose-sm max-w-none break-words ${
              isLayoutBlock && question.layoutType === 'title_desc'
                ? `prose-p:text-2xl prose-p:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h1:font-extrabold ${
                    isReadOnly ? 'text-slate-500 border-slate-200/70' : 'text-gray-900 border-gray-100'
                  } border-b pb-3 w-full`
                : isLayoutBlock
                  ? `prose-p:text-2xl prose-p:font-bold prose-h1:text-2xl prose-h2:text-xl w-full ${
                      isReadOnly ? 'text-slate-500' : ''
                    }`
                  : isReadOnly
                    ? 'text-slate-500'
                    : ''
            }`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }}
          />
          {!isLayoutBlock && question.required && <span className="text-red-400 ml-1 mt-1">*</span>}
        </div>
      </div>

      {question.description && (
        <div
          className={`prose prose-sm max-w-none font-normal leading-relaxed mb-4 break-words ${
            isLayoutBlock && question.layoutType === 'title_desc'
              ? `${mutedSubtextClass} mt-3 text-base text-center w-full`
              : mutedSubtextClass
          }`}
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
                <span className={`text-sm font-semibold ${isReadOnly ? 'text-slate-500' : 'text-gray-700'}`}>
                  Attached Document
                </span>
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
          readOnly={isReadOnly}
          className={`form-input ${readOnlyInputClass} ${isReadOnly ? 'text-slate-500' : ''} ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        />
      )}

      {question.type === 'paragraph' && (
        <textarea
          value={localAnswer}
          onChange={handleTextChange}
          placeholder="Your answer"
          rows="4"
          readOnly={isReadOnly}
          className={`form-input resize-none ${readOnlyInputClass} ${isReadOnly ? 'text-slate-500' : ''} ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        />
      )}

      {(question.type === 'multiple_choice' || question.type === 'radio') && (
        <div className="space-y-2 mt-1">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
                isReadOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'
              } ${
                localAnswer === option.text
                  ? activeOptionClass
                  : inactiveOptionClass
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.text}
                checked={localAnswer === option.text}
                onChange={handleTextChange}
                disabled={isReadOnly}
                className={`w-4 h-4 border-gray-300 ${
                  isReadOnly ? 'text-slate-500 focus:ring-slate-300' : 'text-primary-600 focus:ring-primary-400'
                } ${readOnlyInputClass}`}
              />
              <span className={`ml-3 text-sm font-medium ${optionTextClass}`}>{option.text}</span>
            </label>
          ))}
          {question.allowOther && (
            <div
              className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
                isReadOnly ? 'pointer-events-none' : ''
              } ${
                localAnswer !== '' && !question.options.some(o => o.text === localAnswer)
                  ? activeOptionClass
                  : inactiveOptionClass
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value="other"
                checked={localAnswer !== '' && !question.options.some(o => o.text === localAnswer)}
                onChange={() => setLocalAnswer('')}
                disabled={isReadOnly}
                className={`w-4 h-4 border-gray-300 ${
                  isReadOnly ? 'text-slate-500 focus:ring-slate-300' : 'text-primary-600 focus:ring-primary-400'
                } ${readOnlyInputClass}`}
              />
              <span className={`ml-3 text-sm font-medium ${optionMutedTextClass}`}>
                {t('public.otherLabel', { defaultValue: 'Other' })}
              </span>
              <input
                type="text"
                placeholder={t('public.otherPlaceholder', { defaultValue: 'Custom answer' })}
                readOnly={isReadOnly}
                className={`ml-2 flex-1 bg-transparent border-b border-gray-200 outline-none p-0.5 text-sm ${
                  isReadOnly ? 'border-slate-200 text-slate-500' : 'focus:border-primary-400'
                } ${readOnlyInputClass}`}
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
              className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
                isReadOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'
              } ${
                localAnswers.includes(option.text)
                  ? activeOptionClass
                  : inactiveOptionClass
              }`}
            >
              <input
                type="checkbox"
                checked={localAnswers.includes(option.text)}
                onChange={() => handleCheckboxChange(option.text)}
                disabled={isReadOnly}
                className={`w-4 h-4 border-gray-300 rounded ${
                  isReadOnly ? 'text-slate-500 focus:ring-slate-300' : 'text-primary-600 focus:ring-primary-400'
                } ${readOnlyInputClass}`}
              />
              <span className={`ml-3 text-sm font-medium ${optionTextClass}`}>{option.text}</span>
            </label>
          ))}
          {question.allowOther && (
            <div
              className={`flex items-center p-3 rounded-xl transition-all duration-200 border ${
                isReadOnly ? 'pointer-events-none' : ''
              } ${
                localAnswers.some(a => !question.options.some(o => o.text === a))
                  ? activeOptionClass
                  : inactiveOptionClass
              }`}
            >
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
                disabled={isReadOnly}
                className={`w-4 h-4 border-gray-300 rounded ${
                  isReadOnly ? 'text-slate-500 focus:ring-slate-300' : 'text-primary-600 focus:ring-primary-400'
                } ${readOnlyInputClass}`}
              />
              <span className={`ml-3 text-sm font-medium ${optionMutedTextClass}`}>
                {t('public.otherLabel', { defaultValue: 'Other' })}
              </span>
              <input
                type="text"
                placeholder={t('public.otherPlaceholder', { defaultValue: 'Custom answer' })}
                readOnly={isReadOnly}
                className={`ml-2 flex-1 bg-transparent border-b border-gray-200 outline-none p-0.5 text-sm ${
                  isReadOnly ? 'border-slate-200 text-slate-500' : 'focus:border-primary-400'
                } ${readOnlyInputClass}`}
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
          disabled={isReadOnly}
          className={`form-input ${readOnlyInputClass} ${isReadOnly ? 'text-slate-500' : ''} ${isError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
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
          <div
            className={`flex justify-between items-end mb-3 px-1 text-xs font-semibold uppercase tracking-wider ${
              isReadOnly ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
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
                disabled={isReadOnly}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 border ${
                  Number(localAnswer) === val
                    ? activeScaleClass
                    : inactiveScaleClass
                } ${readOnlyInputClass}`}
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
                <th className={`p-3 text-xs font-bold uppercase tracking-widest ${isReadOnly ? 'text-slate-400' : 'text-gray-400'}`}></th>
                {question.columns?.map((col, i) => (
                  <th key={i} className={`p-3 text-center text-xs font-bold uppercase ${isReadOnly ? 'text-slate-500' : 'text-gray-500'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.rows?.map((row, rowIdx) => (
                <tr key={rowIdx} className="bg-white/40 backdrop-blur-sm rounded-xl border border-gray-100 hover:bg-white/60 transition-colors">
                  <td className={`p-3 text-sm font-semibold whitespace-nowrap border-l border-t border-b border-gray-50 rounded-l-xl ${
                    isReadOnly ? 'text-slate-500' : 'text-gray-700'
                  }`}>
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
                          disabled={isReadOnly}
                          className={`w-4 h-4 border-gray-300 transition-all ${
                            isReadOnly ? 'text-slate-500 focus:ring-slate-300' : 'text-primary-600 focus:ring-primary-400'
                          } ${readOnlyInputClass}`}
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
               <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all group ${
                 isReadOnly ? 'pointer-events-none opacity-40 cursor-default' : 'cursor-pointer'
               } ${
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
                   disabled={uploading || isReadOnly}
                 />
               </label>
               {uploadError && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded">{uploadError}</p>}
             </div>
          ) : (
             <div className={`relative group p-4 border border-gray-200 rounded-xl bg-white max-w-sm flex items-center justify-between shadow-sm ${
               isReadOnly ? 'opacity-60' : ''
             }`}>
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
                  <p
                    className={`text-sm font-semibold truncate ${isReadOnly ? 'text-slate-500' : 'text-gray-800'}`}
                    title={localAnswer.split('/').pop()}
                  >
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
                     className={`text-xs font-medium inline-flex items-center gap-1 mt-1 text-left ${
                       isReadOnly ? 'text-slate-500 pointer-events-none' : 'text-primary-600 hover:text-primary-700 hover:underline'
                     }`}
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
                 disabled={isReadOnly}
                 className={`p-1.5 text-gray-400 rounded-md transition-colors ml-2 shrink-0 ${
                   isReadOnly ? 'pointer-events-none opacity-40' : 'hover:bg-red-50 hover:text-red-500'
                 }`}
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
