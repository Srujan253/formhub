import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, AlertCircle, Share2, ArrowLeft, GripVertical, Type, Image as ImageIcon, LayoutList } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { formAPI, emailAPI } from '../services/api';
import QuestionInput from '../components/QuestionInput';
import InviteModal from '../components/InviteModal';
import Toast from '../components/Toast';
import ImageUpload from '../components/ImageUpload';
import RichTextEditor from '../components/RichTextEditor';
import MediaUpload from '../components/MediaUpload';
import { useBeforeUnload } from 'react-use';

const SaveStatus = ({ status }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="fixed top-20 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 shadow-glass"
  >
    {status === 'saving' ? (
      <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    ) : (
      <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )}
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {status === 'saving' ? 'Saving...' : 'Saved'}
    </span>
  </motion.div>
);

const PaletteTool = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-10 h-10 bg-white rounded-xl shadow-glass border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-100 transition-colors relative group"
    title={label}
  >
    <Icon size={18} />
    <div className="absolute right-12 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
      {label}
    </div>
  </motion.button>
);

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    headerImage: '',
    sections: [
      { id: uuidv4(), title: 'Section 1', description: '', items: [] }
    ],
  });
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  useEffect(() => {
    if (!id || !hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      saveFormSilently();
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges, id]);

  useBeforeUnload(hasUnsavedChanges, 'You have unsaved changes, are you sure you want to leave?');

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      let data = response.data.data;
      if (!data.sections || data.sections.length === 0) {
        data.sections = [
          {
             id: uuidv4(),
             title: 'Section 1',
             description: '',
             items: data.questions || []
          }
        ];
      }
      setFormData(data);
    } catch (err) {
      setError('Failed to load form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormDataChange = (updates) => {
    setFormData({ ...formData, ...updates });
    setHasUnsavedChanges(true);
  };

  const handleSectionChange = (sIndex, updates) => {
    const sections = [...formData.sections];
    sections[sIndex] = { ...sections[sIndex], ...updates };
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleAddItem = (sIndex, type = 'question', layoutType = null) => {
    const newItem = {
      id: uuidv4(),
      type: type === 'layout_block' ? 'layout_block' : 'short_answer',
      layoutType: layoutType,
      title: '',
      description: '',
      mediaUrl: '',
      mediaType: '',
      required: false,
      options: [],
    };
    const sections = [...formData.sections];
    sections[sIndex].items.push(newItem);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
    setActiveSection(sIndex);
  };

  const handleAddSection = () => {
    const newSection = {
      id: uuidv4(),
      title: `Section ${formData.sections.length + 1}`,
      description: '',
      items: [],
    };
    setFormData({ ...formData, sections: [...formData.sections, newSection] });
    setHasUnsavedChanges(true);
    setActiveSection(formData.sections.length);
  };

  const handleDeleteSection = (sIndex) => {
    if (formData.sections.length <= 1) return;
    const sections = formData.sections.filter((_, i) => i !== sIndex);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
    if (activeSection >= sections.length) {
      setActiveSection(Math.max(0, sections.length - 1));
    }
  };

  const handleItemChange = (sIndex, iIndex, updatedItem) => {
    const sections = [...formData.sections];
    sections[sIndex].items[iIndex] = updatedItem;
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleDuplicateItem = (sIndex, iIndex) => {
    const sections = [...formData.sections];
    const itemToDuplicate = sections[sIndex].items[iIndex];
    const duplicatedItem = { ...itemToDuplicate, id: uuidv4() };
    sections[sIndex].items.splice(iIndex + 1, 0, duplicatedItem);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (sIndex, iIndex) => {
    const sections = [...formData.sections];
    sections[sIndex].items.splice(iIndex, 1);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sourceSIndex = parseInt(source.droppableId);
    const destSIndex = parseInt(destination.droppableId);

    const newSections = [...formData.sections];
    const [movedItem] = newSections[sourceSIndex].items.splice(source.index, 1);
    newSections[destSIndex].items.splice(destination.index, 0, movedItem);

    setFormData({ ...formData, sections: newSections });
    setHasUnsavedChanges(true);
  };

  const handleSaveForm = async (e) => {
    if (e) e.preventDefault();
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
        setHasUnsavedChanges(false);
        setTimeout(() => navigate(`/edit/${response.data.data._id}`), 1000);
      }
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const saveFormSilently = async () => {
    if (!id || !formData.title.trim()) return;
    try {
      setAutoSaveStatus('saving');
      await formAPI.updateForm(id, formData);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      setAutoSaveStatus('');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading form...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 py-8 flex">
      <div className="flex-1 pr-16 relative">
        <div className="flex items-center justify-between mb-6">
          <motion.button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
            <ArrowLeft size={16} /> Back to Forms
          </motion.button>
          {id && formData.shareToken && (
            <motion.button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-50/80 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100/80 border border-primary-100">
              <Share2 size={16} /> Share
            </motion.button>
          )}
        </div>

        <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

        <form onSubmit={handleSaveForm} className="card mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">{id ? 'Edit Form' : 'Create New Form'}</h1>
          <div className="mb-5">
            <label className="form-label">Form Title *</label>
            <input type="text" value={formData.title} onChange={(e) => handleFormDataChange({ title: e.target.value })} placeholder="e.g., Customer Feedback Survey" className="form-input text-lg font-semibold" required />
          </div>
          <div className="mb-6">
            <label className="form-label">Description</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
               <RichTextEditor content={formData.description || ''} onChange={(html) => handleFormDataChange({ ...formData, description: html })} placeholder="Add a description (optional)" />
            </div>
          </div>
          <div className="mb-6 space-y-4">
            <ImageUpload label="Form Header Image" value={formData.headerImage || ''} onChange={(url) => { handleFormDataChange({ headerImage: url }); setToast({ message: 'Image successfully updated! ✨', type: 'success' }); setTimeout(() => setToast(null), 3000); }} />
          </div>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          {formData.sections.map((section, sIndex) => (
            <div key={section.id} className="mb-10 relative" onClick={() => setActiveSection(sIndex)}>
              
              <div className={`card mb-4 ${activeSection === sIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <input type="text" value={section.title} onChange={(e) => handleSectionChange(sIndex, { title: e.target.value })} placeholder="Section Title" className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:outline-none w-full px-2 py-1 mb-2 transition-colors" />
                    <input type="text" value={section.description || ''} onChange={(e) => handleSectionChange(sIndex, { description: e.target.value })} placeholder="Description (optional)" className="text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:outline-none w-full px-2 py-1 transition-colors" />
                  </div>
                  {formData.sections.length > 1 && (
                     <button type="button" onClick={() => handleDeleteSection(sIndex)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                       <AlertCircle size={18} />
                     </button>
                  )}
                </div>
              </div>

              <Droppable droppableId={sIndex.toString()}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-4 min-h-[50px] transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-primary-50/50 p-2' : ''}`}>
                    {section.items.map((item, iIndex) => (
                      <Draggable key={item.id} draggableId={item.id} index={iIndex}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className={`${snapshot.isDragging ? 'z-50' : ''}`}>
                            <div className="relative group">
                              <div {...provided.dragHandleProps} className="absolute left-1/2 -top-3 -translate-x-1/2 opacity-0 group-hover:opacity-100 p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing z-10 transition-opacity">
                                <GripVertical size={16} />
                              </div>
                              <QuestionInput
                                question={item}
                                onChange={(updated) => handleItemChange(sIndex, iIndex, updated)}
                                onDuplicate={() => handleDuplicateItem(sIndex, iIndex)}
                                onDelete={() => handleDeleteItem(sIndex, iIndex)}
                                onUploadSuccess={() => { setToast({ message: 'Media updated!', type: 'success' }); setTimeout(() => setToast(null), 3000); }}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            </div>
          ))}
        </DragDropContext>

      </div>

      {/* Floating Palette aligned right of active section loosely */}
      <div className="fixed top-1/2 -translate-y-1/2 right-[max(20px,calc(50vw-450px))] flex flex-col gap-2 p-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-glass z-50">
        <PaletteTool icon={Plus} label="Add Question" onClick={() => handleAddItem(activeSection, 'question')} />
        <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1" />
        <PaletteTool icon={Type} label="Add Title/Desc Block" onClick={() => handleAddItem(activeSection, 'layout_block', 'title_desc')} />
        <PaletteTool icon={ImageIcon} label="Add Image Block" onClick={() => handleAddItem(activeSection, 'layout_block', 'image')} />
        <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1" />
        <PaletteTool icon={LayoutList} label="Add Section" onClick={handleAddSection} />
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-center">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="flex gap-3 p-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-glass pointer-events-auto">
            <motion.button onClick={handleSaveForm} disabled={saving || !hasUnsavedChanges} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 ${saving || !hasUnsavedChanges ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-gray-200/20'}`}>
              {saving ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Now' : 'All Saved'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
export default FormBuilder;
