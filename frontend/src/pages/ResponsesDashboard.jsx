import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, BarChart3, Users, HelpCircle, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { formAPI, responseAPI } from '../services/api';

// Simple horizontal bar chart component
const OptionChart = ({ question, responses }) => {
  const distribution = useMemo(() => {
    const counts = {};
    question.options.forEach((opt) => {
      counts[opt.text] = 0;
    });

    responses.forEach((response) => {
      const answer = response.answers.find((a) => a.questionId === question.id);
      if (answer) {
        if (Array.isArray(answer.value)) {
          answer.value.forEach((v) => {
            if (counts[v] !== undefined) counts[v]++;
          });
        } else if (counts[answer.value] !== undefined) {
          counts[answer.value]++;
        }
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [question, responses]);

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const barColors = [
    'from-primary-400 to-primary-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-sky-400 to-sky-600',
    'from-violet-400 to-violet-600',
    'from-orange-400 to-orange-600',
    'from-teal-400 to-teal-600',
  ];

  return (
    <div className="space-y-2.5">
      {distribution.map((item, index) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium w-24 truncate text-right flex-shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-7 bg-gray-100/80 rounded-lg overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / maxCount) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${barColors[index % barColors.length]} rounded-lg min-w-[2px]`}
            />
          </div>
          <span className="text-xs font-bold text-gray-800 w-12 text-right flex-shrink-0">
            {item.count} <span className="text-gray-400 font-normal">({item.percentage}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
};

const ResponsesDashboard = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formResponse, responsesResponse] = await Promise.all([
        formAPI.getForm(formId),
        responseAPI.getFormResponses(formId),
      ]);
      setForm(formResponse.data.data);
      setResponses(responsesResponse.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load responses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allQuestions = useMemo(() => {
    if (!form) return [];
    if (form.sections) {
      return form.sections.flatMap(s => s.items).filter(i => i.type !== 'layout_block');
    }
    return form.questions || [];
  }, [form]);

  const downloadCSV = () => {
    if (responses.length === 0) {
      alert('No responses to download');
      return;
    }

    const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const headers = ['Respondent Name', 'Date', 'Time', ...allQuestions.map((q) => {
      const doc = new DOMParser().parseFromString(q.title, 'text/html');
      return doc.body.textContent || q.title || "";
    })];
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...responses.map((response) => {
        const dt = new Date(response.createdAt);
        const row = [
          escapeCSV(response.respondentName || 'Anonymous'),
          escapeCSV(dt.toLocaleDateString()),
          escapeCSV(dt.toLocaleTimeString()),
        ];
        allQuestions.forEach((question) => {
          const answer = response.answers.find(
            (a) => a.questionId === question.id
          );
          const val = answer?.value;
          row.push(escapeCSV(Array.isArray(val) ? val.join(', ') : (val || '')));
        });
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
  };

  const chartableQuestions = useMemo(() => {
    if (!allQuestions.length) return [];
    return allQuestions.filter((q) =>
      ['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type)
    );
  }, [allQuestions]);

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
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading responses...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Form not found</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Back button */}
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium mb-6"
      >
        <ArrowLeft size={16} />
        Back to Forms
      </motion.button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 border-t-4 border-primary-500"
      >
        {form.headerImage && (
          <div className="w-full h-32 md:h-48 mb-6 rounded-2xl overflow-hidden shadow-glass border border-gray-100">
            <img 
              src={form.headerImage} 
              alt="Form Header" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1 break-words">{form.title}</h1>
            {form.description && (
              <div 
                className="prose prose-sm max-w-none text-gray-500 mb-4 break-words"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
              />
            )}
          </div>
          {responses.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCSV}
              className="btn-primary shrink-0 flex items-center gap-2 text-sm z-10 sm:mt-0"
            >
              <Download size={16} />
              Export CSV
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-100/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-primary-500" />
              <p className="text-primary-600 text-xs font-semibold uppercase tracking-wider">Responses</p>
            </div>
            <p className="text-2xl font-extrabold text-primary-900">{responses.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-100/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={14} className="text-emerald-500" />
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">Questions</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-900">{allQuestions.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-100/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-amber-500" />
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Created</p>
            </div>
            <p className="text-sm font-bold text-amber-900">
              {new Date(form.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {error && (
        <motion.div className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-gray-100 w-fit">
        {['summary', 'individual'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'summary' ? (
              <span className="flex items-center gap-2"><TrendingUp size={14} /> Summary</span>
            ) : (
              <span className="flex items-center gap-2"><Users size={14} /> Individual</span>
            )}
          </button>
        ))}
      </div>

      {responses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-primary-400" />
          </div>
          <p className="text-gray-500 mb-4 text-sm">No responses yet</p>
          <button
            onClick={() => navigate(`/form/${formId}`)}
            className="btn-primary text-sm"
          >
            Fill Form
          </button>
        </motion.div>
      ) : activeTab === 'summary' ? (
        /* Summary View with Charts */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          {chartableQuestions.length > 0 && (
            <>
              {chartableQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="card"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={14} className="text-primary-500" />
                      <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                        {question.type.replace('_', ' ')}
                      </span>
                    </div>
                      <div 
                        className="text-base font-bold text-gray-900 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }}
                      />
                  </div>
                  <OptionChart question={question} responses={responses} />
                </motion.div>
              ))}
            </>
          )}

          {/* Text responses summary */}
          {allQuestions
            .filter((q) => ['short_answer', 'paragraph'].includes(q.type))
            .map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (chartableQuestions.length + index) * 0.08 }}
                className="card"
              >
                <h3 className="text-base font-bold text-gray-900 mb-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }} />
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {responses.map((response, rIndex) => {
                    const answer = response.answers.find((a) => a.questionId === question.id);
                    if (!answer?.value) return null;
                    return (
                      <div
                        key={rIndex}
                        className="px-4 py-2.5 bg-gray-50/80 rounded-xl text-sm text-gray-700 border border-gray-100/80"
                      >
                        {answer.value}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
        </motion.div>
      ) : (
        /* Individual Responses */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {responses.map((response, index) => (
            <motion.div
              key={response._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="mb-4 pb-3 border-b border-gray-100/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {(response.respondentName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {response.respondentName || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Response #{index + 1} • {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {allQuestions.map((question) => {
                  const answer = response.answers.find(
                    (a) => a.questionId === question.id
                  );

                  return (
                    <div key={question.id}>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }} />
                      <div className="px-4 py-2.5 bg-gray-50/80 rounded-xl text-sm text-gray-700 border border-gray-100/80">
                        {Array.isArray(answer?.value)
                          ? answer.value.join(', ')
                          : answer?.value || <span className="text-gray-400 italic">No answer</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResponsesDashboard;
