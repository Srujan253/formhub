import { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Copy, GripVertical, Type, AlignLeft,
  Circle, CheckSquare, ChevronDown, Sliders,
  Grid3X3, List, Upload, Layout, Image as ImageIcon, X,
  ImagePlus, CircleDot, ChevronDownCircle, CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudinaryAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import MediaUpload from './MediaUpload';

const QuestionInput = ({ question, onChange, onDuplicate, onDelete, onUploadSuccess }) => {
  const { t } = useTranslation();
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleChange = (html) => {
    onChange({ ...question, title: html });
  };
  
  const handleDescriptionChange = (html) => {
    onChange({ ...question, description: html });
  };

  const handleTypeChange = (newType) => {
    let updates = { type: newType, options: [] };
    
    if (newType === 'linear_scale') {
      updates = { ...updates, minScale: 1, maxScale: 5, minLabel: '', maxLabel: '' };
    } else if (newType === 'grid_choice' || newType === 'grid_checkbox') {
      updates = { ...updates, rows: ['Row 1'], columns: ['Column 1'] };
    } else if (newType === 'image_section') {
      updates = { ...updates, imageUrl: '' };
    }
    
    onChange({ ...question, ...updates });
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

  const hasOptions = ['radio', 'checkboxes', 'dropdown'].includes(question.type);
  const canHaveOther = ['radio', 'checkboxes'].includes(question.type);
  const isLayoutBlock = question.type === 'layout_block';

  const questionTypes = [
    { value: 'short_answer', label: t('formBuilder.types.short_answer', { defaultValue: 'Short Answer' }), icon: <Type size={18} className="text-primary-500 mr-3" /> },
    { value: 'paragraph', label: t('formBuilder.types.paragraph', { defaultValue: 'Paragraph' }), icon: <AlignLeft size={18} className="text-primary-500 mr-3" /> },
    { value: 'radio', label: t('formBuilder.types.radio', { defaultValue: 'Radio buttons' }), icon: <CircleDot size={18} className="text-primary-500 mr-3" /> },
    { value: 'checkboxes', label: t('formBuilder.types.checkboxes', { defaultValue: 'Checkboxes' }), icon: <CheckSquare size={18} className="text-primary-500 mr-3" /> },
    { value: 'dropdown', label: t('formBuilder.types.dropdown', { defaultValue: 'Dropdown' }), icon: <ChevronDownCircle size={18} className="text-primary-500 mr-3" /> },
    { value: 'linear_scale', label: t('formBuilder.types.linear_scale', { defaultValue: 'Linear Scale' }), icon: <Sliders size={18} className="text-primary-500 mr-3" /> },
    { value: 'grid_choice', label: t('formBuilder.types.grid_choice', { defaultValue: 'Multiple Choice Grid' }), icon: <Grid3X3 size={18} className="text-primary-500 mr-3" /> },
    { value: 'grid_checkbox', label: t('formBuilder.types.grid_checkbox', { defaultValue: 'Checkbox Grid' }), icon: <Grid3X3 size={18} className="text-primary-500 mr-3" /> },
    { value: 'file_upload', label: t('formBuilder.types.file_upload', { defaultValue: 'File Upload' }), icon: <CloudUpload size={18} className="text-primary-500 mr-3" /> },
  ];

  const currentType = questionTypes.find(t => t.value === question.type) || questionTypes[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`card mb-4 border-l-4 group relative ${isTypeDropdownOpen ? 'z-50' : 'z-10'} ${isLayoutBlock ? 'border-gray-400 bg-gray-50' : 'border-primary-500'}`}
    >
      <div className="flex items-center justify-center mb-3 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <label className="form-label">{isLayoutBlock ? (question.layoutType === 'image' ? t('formBuilder.imageBlockTitle', { defaultValue: 'Image Block Title' }) : t('formBuilder.textBlockTitle', { defaultValue: 'Text Block Title' })) : t('formBuilder.questionTitle')}</label>
          <RichTextEditor
             content={question.title || ''}
             onChange={handleTitleChange}
             placeholder={isLayoutBlock ? t('formBuilder.enterTitleHint', { defaultValue: 'Enter title here (optional)' }) : t('formBuilder.enterQuestionHint', { defaultValue: 'Enter question here' })}
          />
          
          {!isLayoutBlock && !question.hasDescription && !question.description && (
             <button type="button" onClick={() => onChange({ ...question, hasDescription: true })} className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 focus:outline-none hover:underline">
                {t('formBuilder.addDescription', { defaultValue: 'Add Description' })}
             </button>
          )}
          {!isLayoutBlock && (question.hasDescription || question.description) && (
            <div className="mt-3 relative group border border-gray-100 rounded-xl bg-gray-50/50">
              <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
                <label className="form-label !mb-0 text-xs text-gray-500 uppercase">{t('formBuilder.description', { defaultValue: 'Description' })}</label>
                <button type="button" onClick={() => onChange({ ...question, hasDescription: false, description: '' })} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove description">
                  <X size={14} />
                </button>
              </div>
              <RichTextEditor
                content={question.description || ''}
                onChange={handleDescriptionChange}
                placeholder={t('formBuilder.enterDescriptionHint', { defaultValue: 'Enter description here (optional)' })}
              />
            </div>
          )}

          {isLayoutBlock && question.layoutType === 'title_desc' && (
            <div className="mt-3 border rounded-xl overflow-hidden bg-white">
              <label className="form-label px-3 py-2 text-xs text-gray-500 uppercase">{t('formBuilder.textSegment', { defaultValue: 'Text Segment (Description)' })}</label>
              <RichTextEditor
                content={question.description || ''}
                onChange={handleDescriptionChange}
                placeholder={t('formBuilder.enterDescriptionHint', { defaultValue: 'Enter description here' })}
              />
            </div>
          )}

          {isLayoutBlock && question.layoutType === 'image' ? (
             <div className="mt-4">
               <ImageUpload value={question.imageUrl || question.mediaUrl} onChange={(url) => { onChange({ ...question, mediaUrl: url, mediaType: 'image' }); if(onUploadSuccess) onUploadSuccess(); }} label={t('formBuilder.uploadMainImage', { defaultValue: 'Upload Main Image' })} />
             </div>
          ) : (
            question.mediaUrl && !isLayoutBlock && (
              <div className="mt-3">
                <MediaUpload
                  mediaUrl={question.mediaUrl}
                  mediaType={question.mediaType}
                  onChange={({ mediaUrl, mediaType }) => {
                    onChange({ ...question, mediaUrl, mediaType });
                    if (onUploadSuccess) onUploadSuccess();
                  }}
                />
              </div>
            )
          )}
        </div>
        <div className="flex gap-2 ml-4">
          {!question.mediaUrl && !isLayoutBlock && (
            <MediaUpload
              mediaUrl=""
              mediaType=""
              onChange={({ mediaUrl, mediaType }) => {
                onChange({ ...question, mediaUrl, mediaType });
                if (onUploadSuccess) onUploadSuccess();
              }}
              compact={true}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDuplicate}
            className="btn-secondary !px-3"
            title="Duplicate"
          >
            <Copy size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="btn-danger !px-3"
            title="Delete"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {!isLayoutBlock && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="relative" ref={dropdownRef}>
            <label className="form-label">{t('formBuilder.questionType', { defaultValue: 'Question Type' })}</label>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full form-input flex items-center justify-between text-left h-[48px]"
            >
              <div className="flex items-center">
                {currentType.icon}
                <span className="font-medium text-gray-700">{t(`formBuilder.types.${currentType.value}`, { defaultValue: currentType.label })}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isTypeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-lumina-lg max-h-[300px] overflow-y-auto"
                >
                  <div className="py-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        handleTypeChange(type.value);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 transition-colors text-sm ${
                        question.type === type.value ? 'bg-primary-50/50 font-semibold text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type.icon}
                      <span className="ml-2">{t(`formBuilder.types.${type.value}`, { defaultValue: type.label })}</span>
                      {question.type === type.value && <CircleDot size={14} className="ml-auto text-primary-500" />}
                    </button>
                  ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <span className="ml-3 text-sm text-gray-700 font-medium">{t('formBuilder.required', { defaultValue: 'Required' })}</span>
            </label>
          </div>
        </div>
      )}

      {!isLayoutBlock && canHaveOther && (
        <div className="mb-4">
          <label className="flex items-center cursor-pointer group/toggle">
            <div className="relative">
              <input
                type="checkbox"
                checked={question.allowOther}
                onChange={(e) => onChange({ ...question, allowOther: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-8 h-4 rounded-full transition-colors duration-300 ${
                question.allowOther ? 'bg-primary-400' : 'bg-gray-200'
              }`}></div>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                question.allowOther ? 'translate-x-4' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-600">{t('formBuilder.addOther', { defaultValue: 'Add "Other" option' })}</span>
          </label>
        </div>
      )}

      {!isLayoutBlock && hasOptions && (
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

      {!isLayoutBlock && question.type === 'linear_scale' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label text-xs">Scale Range</label>
            <div className="flex items-center gap-2">
              <select
                value={question.minScale}
                onChange={(e) => onChange({ ...question, minScale: Number(e.target.value) })}
                className="form-input text-xs"
              >
                <option value="0">0</option>
                <option value="1">1</option>
              </select>
              <span className="text-gray-400 text-xs">to</span>
              <select
                value={question.maxScale}
                onChange={(e) => onChange({ ...question, maxScale: Number(e.target.value) })}
                className="form-input text-xs"
              >
                {[2,3,4,5,6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Label for min (optional)"
              value={question.minLabel || ''}
              onChange={(e) => onChange({ ...question, minLabel: e.target.value })}
              className="form-input text-xs"
            />
            <input
              type="text"
              placeholder="Label for max (optional)"
              value={question.maxLabel || ''}
              onChange={(e) => onChange({ ...question, maxLabel: e.target.value })}
              className="form-input text-xs"
            />
          </div>
        </div>
      )}

      {!isLayoutBlock && question.type === 'file_upload' && (
        <div className="mb-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 italic text-sm text-gray-500">
          Respondents will be able to upload files to this question.
        </div>
      )}

      {!isLayoutBlock && (question.type === 'grid_choice' || question.type === 'grid_checkbox') && (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="form-label text-xs flex justify-between">
                Rows <span>(Questions)</span>
              </label>
              <textarea
                className="form-input text-xs font-mono"
                placeholder="One per line..."
                rows="4"
                value={question.rows?.join('\n') || ''}
                onChange={(e) => onChange({ ...question, rows: e.target.value.split('\n') })}
              />
            </div>
            <div>
              <label className="form-label text-xs flex justify-between">
                Columns <span>(Options)</span>
              </label>
              <textarea
                className="form-input text-xs font-mono"
                placeholder="One per line..."
                rows="4"
                value={question.columns?.join('\n') || ''}
                onChange={(e) => onChange({ ...question, columns: e.target.value.split('\n') })}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionInput;
