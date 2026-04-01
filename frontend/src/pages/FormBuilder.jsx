import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, AlertCircle, Share2, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { formAPI, emailAPI } from '../services/api';
import QuestionInput from '../components/QuestionInput';
import InviteModal from '../components/InviteModal';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      setFormData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      type: 'short_answer',
      title: '',
      required: false,
      options: [],
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const handleQuestionChange = (index, updatedQuestion) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = updatedQuestion;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleDuplicateQuestion = (index) => {
    const questionToDuplicate = formData.questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: uuidv4(),
    };
    const updatedQuestions = [
      ...formData.questions.slice(0, index + 1),
      duplicatedQuestion,
      ...formData.questions.slice(index + 1),
    ];
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        setError('Form title is required');
        return;
      }

      setSaving(true);
      if (id) {
        await formAPI.updateForm(id, formData);
        setSuccess('Form updated successfully!');
      } else {
        const response = await formAPI.createForm(formData);
        setSuccess('Form created successfully!');
        setTimeout(() => {
          navigate(`/edit/${response.data.data._id}`);
        }, 1000);
      }
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save form');
      console.error(err);
    } finally {
      setSaving(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Forms
        </motion.button>

        {id && formData.shareToken && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50/80 text-primary-700 rounded-xl
                       text-sm font-medium hover:bg-primary-100/80 transition-all duration-300 border border-primary-100"
          >
            <Share2 size={16} />
            Share
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl backdrop-blur-sm"
          >
            <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {success}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveForm} className="card mb-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          {id ? 'Edit Form' : 'Create New Form'}
        </h1>

        <div className="mb-5">
          <label className="form-label">Form Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Customer Feedback Survey"
            className="form-input text-lg font-semibold"
            required
          />
        </div>

        <div className="mb-6">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add a description (optional)"
            rows="3"
            className="form-input resize-none"
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Form
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">Questions</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddQuestion}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Question
          </motion.button>
        </div>

        <AnimatePresence>
          {formData.questions.map((question, index) => (
            <QuestionInput
              key={question.id}
              question={question}
              onChange={(updatedQuestion) =>
                handleQuestionChange(index, updatedQuestion)
              }
              onDuplicate={() => handleDuplicateQuestion(index)}
              onDelete={() => handleDeleteQuestion(index)}
            />
          ))}
        </AnimatePresence>

        {formData.questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 card"
          >
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-primary-400" />
            </div>
            <p className="text-gray-500 mb-4 text-sm">No questions yet. Start building your form.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddQuestion}
              className="btn-primary text-sm"
            >
              Add First Question
            </motion.button>
          </motion.div>
        )}
      </div>

      {formData.shareToken && (
        <InviteModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareToken={formData.shareToken}
          formTitle={formData.title}
          formDescription={formData.description}
          formId={id}
          onSendInvites={(data) => emailAPI.sendInvites(data)}
        />
      )}
    </motion.div>
  );
};

export default FormBuilder;
