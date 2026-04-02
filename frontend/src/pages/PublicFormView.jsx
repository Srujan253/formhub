import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, AlertCircle, Sparkles, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { formAPI, responseAPI } from '../services/api';
import QuestionPreview from '../components/QuestionPreview';

const PublicFormView = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [respondentName, setRespondentName] = useState('');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getFormByToken(token);
      let data = response.data.data;
      if (!data.sections || data.sections.length === 0) {
        data.sections = [
          {
             id: 'default',
             title: data.title,
             description: data.description,
             items: data.questions || []
          }
        ];
      }
      setForm(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This form is currently paused and not accepting responses.');
      } else {
        setError('This form is not available or the link may be incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }
  };

  const validateSection = (sectionIndex) => {
    const newErrors = {};
    const sectionItems = form.sections[sectionIndex].items;

    sectionItems.forEach((item) => {
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

  const validateAll = () => {
    const newErrors = {};
    form.sections.forEach(sec => {
      sec.items.forEach(item => {
        if (item.type !== 'layout_block' && item.required) {
          const answer = answers[item.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            newErrors[item.id] = true;
          }
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (validateSection(currentSectionIndex)) {
      setCurrentSectionIndex(prev => Math.min(prev + 1, form.sections.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError('Please fill in all required fields in this section.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCurrentSectionIndex(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const currentIsMultiSection = form.sections.length > 1;
    const currentIsLastSection = currentSectionIndex === form.sections.length - 1;

    // Completely block submit if we are not on the last section!
    if (currentIsMultiSection && !currentIsLastSection) {
      handleNext(e);
      return; 
    }

    if (!validateAll()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const allItems = form.sections.flatMap(s => s.items);
      const formattedAnswers = allItems
        .filter(item => item.type !== 'layout_block')
        .map((item) => ({
          questionId: item.id,
          questionType: item.type,
          value: answers[item.id] || '',
        }));

      await responseAPI.submitPublicResponse({
        shareToken: token,
        answers: formattedAnswers,
        respondentName: respondentName.trim() || 'Anonymous',
      });

      setSuccess(true);
      setAnswers({});
      setRespondentName('');
      setError('');
      setCurrentSectionIndex(0);
    } catch (err) {
      setError('Failed to submit your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin inline-block"></div>
          <p className="text-gray-400 mt-4 text-sm font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 px-4">
        <div className="card text-center py-16 max-w-md w-full">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16 max-w-md w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-emerald-500/30">
             <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{t('public.thankYou')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('public.success')}</p>
          <button onClick={() => { setSuccess(false); setAnswers({}); }} className="btn-secondary text-sm">Submit Another</button>
        </motion.div>
      </div>
    );
  }

  const isMultiSection = form.sections.length > 1;
  const currentSection = form.sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === form.sections.length - 1;
  const totalQuestions = form.sections.flatMap(s => s.items).filter(i => i.type !== 'layout_block').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/25">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Pulse</span>
          </div>
          {isMultiSection && (
             <div className="text-xs font-semibold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
               Page {currentSectionIndex + 1} of {form.sections.length}
             </div>
          )}
        </div>

        {/* Global Form Header - Always keep it visible or only on first page?
            Usually form title stays at the top. Let's keep form title at the top,
            and section title as a separate card below it. */}
        <div className="card mb-6 border-t-4 border-primary-500">
          {form.headerImage && (
            <div className="w-full h-48 md:h-64 mb-6 rounded-2xl overflow-hidden shadow-glass border border-gray-100">
              <img src={form.headerImage} alt="Header" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <div 
              className="prose prose-sm max-w-none text-gray-500 leading-relaxed mb-4 break-words"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
            />
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>{totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Fields marked with <span className="text-red-400">*</span> are required</span>
          </div>
        </div>

        {/* Section Header if it's multi-section and has title */}
        {isMultiSection && (currentSection.title || currentSection.description) && (
          <motion.div
            key={`header-${currentSectionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card mb-6 bg-primary-50/30 border border-primary-100/50"
          >
             {currentSection.title && <h2 className="text-xl font-bold text-gray-800 mb-2">{currentSection.title}</h2>}
             {currentSection.description && <p className="text-gray-500 text-sm">{currentSection.description}</p>}
          </motion.div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSectionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentSection.items.map((item) => (
                <QuestionPreview
                  key={item.id}
                  question={item}
                  answer={answers[item.id]}
                  onChange={handleAnswerChange}
                  errors={errors}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-6 gap-4">
            {isMultiSection && !isFirstSection ? (
               <button
                 type="button"
                 onClick={handleBack}
                 className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
               >
                 <ChevronLeft size={18} /> Back
               </button>
            ) : (
              <div></div>
            )}

            {isMultiSection && !isLastSection ? (
               <button
                 type="button"
                 onClick={handleNext}
                 className="px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/25 transition-all"
               >
                 Next <ChevronRight size={18} />
               </button>
            ) : (
               <button
                 type="submit"
                 disabled={submitting}
                 className={`px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all duration-300 shadow-md ${
                   submitting
                     ? 'bg-gray-400 shadow-none cursor-not-allowed'
                     : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-emerald-500/40'
                 }`}
               >
                 {submitting ? (
                   <>
                     <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                     {t('public.submitting')}
                   </>
                 ) : (
                   <>
                     <Send size={18} /> Submit
                   </>
                 )}
               </button>
            )}
          </div>
        </form>

        <div className="text-center pb-4 mt-8 pt-8 border-t border-gray-200/50">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-primary-500">Pulse</span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default PublicFormView;
