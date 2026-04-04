import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { formAPI, responseAPI } from '../services/api';
import QuestionPreview from '../components/QuestionPreview';

const FileModal = ({ url, onClose }) => {
  if (!url) return null;
  const isImg = url.includes('/image/upload') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
      >
         <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800">File Preview</h3>
           <div className="flex items-center gap-2">
             <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                 <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
               </svg>
               Open Tab
             </a>
             <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
           </div>
         </div>
         <div className="flex-1 overflow-auto bg-gray-100/50 flex items-center justify-center p-4 min-h-[400px]">
           {isImg ? (
             <img src={url} alt="Preview" className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded drop-shadow-sm" />
           ) : (
             url.endsWith('.pdf') ? (
               <iframe src={url + '#toolbar=0'} className="w-full h-[calc(90vh-100px)] rounded shadow-sm border border-gray-200 bg-white" title="PDF Preview" />
             ) : (
               <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm">
                 <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-600 font-medium mb-3">No preview available for this file type.</p>
                 <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                   Download / Open File
                 </a>
               </div>
             )
           )}
         </div>
      </motion.div>
    </div>
  );
};

const FormViewer = ({ previewData = null, isPreviewMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(previewData);
  const [loading, setLoading] = useState(!previewData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    if (previewData) {
      setForm(previewData);
      setLoading(false);
    } else if (id) {
      fetchForm();
    }
  }, [id, previewData]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      setForm(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }
  };

  const getAllItems = () => {
    if (form.sections && form.sections.length > 0) {
      return form.sections.flatMap(section => section.items || []);
    }
    return form.questions || [];
  };

  const validateForm = () => {
    const newErrors = {};

    getAllItems().forEach((item) => {
      if (item.type !== 'layout_block' && item.required) {
        const answer = answers[item.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[item.id] = true;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    if (isPreviewMode) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = getAllItems()
        .filter(item => item.type !== 'layout_block')
        .map((question) => ({
          questionId: question.id,
          questionType: question.type,
          value: answers[question.id] || '',
        }));

      await responseAPI.submitResponse({
        formId: id,
        answers: formattedAnswers,
      });

      setSuccess(true);
      setAnswers({});
      setError('');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600"></div>
        </motion.div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Form not found</h2>
          <p className="text-gray-500 mb-6 text-sm">The form you're looking for doesn't exist</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Submitted!</h2>
          <p className="text-gray-500 text-sm">Thank you for your response. Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`max-w-2xl mx-auto ${isPreviewMode ? 'px-1' : 'px-4'} py-8`}
    >
      {!isPreviewMode && (
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 border-t-4 border-primary-500"
      >
        {form.headerImage && (
          <div className="w-full h-48 md:h-64 mb-6 rounded-2xl overflow-hidden shadow-glass border border-gray-100 bg-gray-50/50 flex items-center justify-center">
            <img 
              src={form.headerImage} 
              alt="Form Header" 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
        {form.description && (
          <div 
            className="prose prose-sm max-w-none text-gray-500 leading-relaxed mb-4 break-words"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
          />
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {(form.sections && form.sections.length > 0 ? form.sections : [{ id: 'default', title: '', items: form.questions || [] }]).map((section, sIndex) => {
          const isDefaultFirstSection = sIndex === 0 && form.sections.length <= 1 && (!section.title || section.title === 'Section 1' || !section.title.trim()) && !section.description?.trim();
          
          return (
          <div key={section.id || sIndex} className="mb-8 space-y-4">
            {!isDefaultFirstSection && (section.title?.trim() || section.description?.trim()) && (
              <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                {section.title?.trim() && <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">{section.title}</h2>}
                {section.description?.trim() && <p className="text-gray-500 mt-2 text-sm">{section.description}</p>}
              </div>
            )}
            {(section.items || []).map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <QuestionPreview
                  question={question}
                  answer={answers[question.id]}
                  onChange={handleAnswerChange}
                  errors={errors}
                  onViewFile={setViewingFile}
                />
              </motion.div>
            ))}
          </div>
        );
      })}

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={submitting}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-white
            transition-all duration-300 shadow-lg ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed shadow-gray-400/20'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-primary-500/25 hover:shadow-primary-500/40'
          }`}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Response
            </>
          )}
        </motion.button>
      </form>
      <AnimatePresence>
        {viewingFile && <FileModal url={viewingFile} onClose={() => setViewingFile(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default FormViewer;
