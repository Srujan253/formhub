import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formAPI, responseAPI } from '../services/api';
import QuestionPreview from '../components/QuestionPreview';

const FormViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchForm();
  }, [id]);

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
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 border-t-4 border-primary-500"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-500 text-base leading-relaxed">{form.description}</p>
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
        {form.questions.map((question, index) => (
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
            />
          </motion.div>
        ))}

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
    </motion.div>
  );
};

export default FormViewer;
