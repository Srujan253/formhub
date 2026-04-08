import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, AlertCircle, Sparkles, User, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { formAPI, responseAPI } from '../services/api';
import QuestionPreview from '../components/QuestionPreview';

const FileModal = ({ url, onClose }) => {
  const { t } = useTranslation();
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
           <h3 className="font-semibold text-gray-800">{t('public.filePreview')}</h3>
           <div className="flex items-center gap-2">
             <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                 <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
               </svg>
               {t('public.openTab')}
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
               <iframe src={url + '#toolbar=0'} className="w-full h-[calc(90vh-100px)] rounded shadow-sm border border-gray-200 bg-white" title={t('public.filePreview')} />
             ) : (
               <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm">
                 <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-600 font-medium mb-3">{t('public.noPreview')}</p>
                 <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                   {t('public.downloadOpen')}
                 </a>
               </div>
             )
           )}
         </div>
      </motion.div>
    </div>
  );
};

const PublicFormView = () => {
  const { t, i18n } = useTranslation();
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
  const [viewingFile, setViewingFile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'jp' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [currentSectionIndex]);

  useEffect(() => {
    if (localStorage.getItem(`submitted_${token}`)) {
      setSuccess(true);
      setLoading(false);
      return;
    }
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
        setError(t('public.formPaused'));
      } else {
        setError(t('public.formNotAvailable'));
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
      setError(t('public.fillRequiredSection'));
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
    if (!showConfirm && currentIsMultiSection && !currentIsLastSection) {
      handleNext(e);
      return;
    }

    if (!validateAll()) {
      setError(t('public.fillRequired'));
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        respondentName: respondentName.trim() || '',
      });

      localStorage.setItem(`submitted_${token}`, 'true');
      setSuccess(true);
      setAnswers({});
      setRespondentName('');
      setError('');
      setCurrentSectionIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || t('public.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin inline-block"></div>
          <p className="text-gray-400 mt-4 text-sm font-medium">{t('public.loadingForm')}</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 px-4">
        <div className="card text-center py-16 max-w-md w-full">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('public.formUnavailable')}</h2>
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
            <span className="text-sm font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">{t('appName', { defaultValue: 'Pulse' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
              {i18n.language && i18n.language.startsWith('en') ? '日本語' : 'English'}
            </button>
            {isMultiSection && (
               <div className="text-xs font-semibold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                 {t('public.pageOf', { current: currentSectionIndex + 1, total: form.sections.length })}
               </div>
            )}
          </div>
        </div>

        {/* Global Form Header - Always keep it visible or only on first page?
            Usually form title stays at the top. Let's keep form title at the top,
            and section title as a separate card below it. */}
        <div className="card mb-6 border-t-4 border-primary-500">
          {form.headerImage && (
            <div className="w-full h-48 md:h-64 mb-6 rounded-2xl overflow-hidden shadow-glass border border-gray-100 bg-gray-50/50 flex items-center justify-center">
              <img src={form.headerImage} alt="Header" className="max-w-full max-h-full object-contain" />
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
            <span>{t('public.questionCount', { count: totalQuestions })}</span>
            <span>•</span>
            <span>{t('public.requiredField')}</span>
          </div>
        </div>

        {/* Section Header if it's multi-section and has title */}
        {isMultiSection && (currentSection.title?.trim() || currentSection.description?.trim()) && (
          <motion.div
            key={`header-${currentSectionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card mb-6 bg-primary-50/30 border border-primary-100/50"
          >
             {currentSection.title?.trim() && <h2 className="text-xl font-bold text-gray-800 mb-2">{currentSection.title}</h2>}
             {currentSection.description?.trim() && (
               <div className="relative">
                 <div className={`text-gray-500 text-sm whitespace-pre-wrap transition-all duration-300 ${!isDescriptionExpanded && currentSectionIndex > 0 ? 'line-clamp-2' : ''}`}>
                   {currentSection.description}
                 </div>
                 {currentSectionIndex > 0 && currentSection.description.split('\\n').length > 2 && (
                   <button 
                     type="button" 
                     onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                     className="mt-2 text-primary-600 text-xs font-semibold hover:text-primary-700 flex items-center gap-1"
                   >
                     {isDescriptionExpanded ? 'Show less' : 'Show more'}
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                   </button>
                 )}
               </div>
             )}
          </motion.div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-20">
          {showConfirm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="card text-center py-6 border-b-4 border-emerald-500 bg-emerald-50/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('public.confirmTitle', { defaultValue: 'Confirm Your Responses' })}</h2>
                <p className="text-gray-600 text-sm">{t('public.confirmDesc', { defaultValue: 'Please verify your information is correct before submitting. You can edit your answers directly below.' })}</p>
              </div>
              
              {form.sections.map((section, sIndex) => (
                <div key={section.id || sIndex} className="space-y-4 mb-8">
                  {(section.title || section.description) && (
                    <div className="card bg-gray-50/50 border border-gray-100">
                      {section.title && <h3 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h3>}
                      {section.description && <p className="text-sm text-gray-600 whitespace-pre-wrap">{section.description}</p>}
                    </div>
                  )}
                  {section.items.map((item) => (
                    <QuestionPreview
                      key={item.id}
                      question={item}
                      answer={answers[item.id]}
                      onChange={handleAnswerChange}
                      errors={errors}
                      onViewFile={setViewingFile}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          ) : (
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
                    onViewFile={setViewingFile}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="flex justify-between items-center pt-6 gap-4">
            {showConfirm ? (
               <button
                 type="button"
                 onClick={() => setShowConfirm(false)}
                 className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
               >
                 <ChevronLeft size={18} /> {t('public.back', { defaultValue: 'Back to Form' })}
               </button>
            ) : isMultiSection && !isFirstSection ? (
               <button
                 type="button"
                 onClick={handleBack}
                 className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
               >
                 <ChevronLeft size={18} /> {t('public.back')}
               </button>
            ) : (
              <div></div>
            )}

            {!showConfirm && isMultiSection && !isLastSection ? (
               <button
                 type="button"
                 onClick={handleNext}
                 className="px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/25 transition-all"
               >
                 {t('public.next')} <ChevronRight size={18} />
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
                       <Send size={18} /> {showConfirm ? t('public.confirmSubmit', { defaultValue: 'Confirm & Submit' }) : t('public.submitButton')}
                     </>
                   )}
                 </button>
            )}
          </div>
        </form>

        <div className="text-center pb-4 mt-8 pt-8 border-t border-gray-200/50">
          <p className="text-xs text-gray-400">
            {t('public.poweredBy')} <span className="font-semibold text-primary-500">{t('appName', { defaultValue: 'Pulse' })}</span>
          </p>
        </div>
      </div>
      <AnimatePresence>
        {viewingFile && <FileModal url={viewingFile} onClose={() => setViewingFile(null)} />}
      </AnimatePresence>
    </div>
  );
};
export default PublicFormView;
