import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formAPI, responseAPI } from '../services/api';
import QuestionPreview from '../components/QuestionPreview';

const PublicFormView = () => {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getFormByToken(token);
      setForm(response.data.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This form is currently paused and not accepting responses.');
      } else {
        setError('This form is not available or the link may be incorrect.');
      }
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

  const validateForm = () => {
    const newErrors = {};

    form.questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = true;
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

    try {
      setSubmitting(true);
      const formattedAnswers = form.questions.map((question) => ({
        questionId: question.id,
        questionType: question.type,
        value: answers[question.id] || '',
      }));

      await responseAPI.submitPublicResponse({
        shareToken: token,
        answers: formattedAnswers,
      });

      setSuccess(true);
      setAnswers({});
      setError('');
    } catch (err) {
      setError('Failed to submit your response. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600"></div>
          </motion.div>
          <p className="text-gray-400 mt-4 text-sm font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16 max-w-md w-full"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30"
          >
            <motion.svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 80,
                y: Math.sin((i * 60 * Math.PI) / 180) * 80,
              }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
              className="absolute left-1/2 top-1/3 w-2 h-2 bg-emerald-400 rounded-full"
            />
          ))}

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-extrabold text-gray-900 mb-2"
          >
            Thank You!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-gray-500 text-sm mb-6"
          >
            Your response has been successfully submitted.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setSuccess(false); setAnswers({}); }}
            className="btn-secondary text-sm"
          >
            Submit Another Response
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-2xl mx-auto"
      >
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/25">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            FormHub
          </span>
        </motion.div>

        {/* Form header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card mb-6 border-t-4 border-primary-500"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-500 text-base leading-relaxed">{form.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>{form.questions.length} question{form.questions.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Fields marked with <span className="text-red-400">*</span> are required</span>
          </div>
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
          {form.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
            >
              <QuestionPreview
                question={question}
                answer={answers[question.id]}
                onChange={handleAnswerChange}
                errors={errors}
              />
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + form.questions.length * 0.06 }}
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

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-primary-500">FormHub</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicFormView;
