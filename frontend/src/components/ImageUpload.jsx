import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, ImagePlus, Loader2, CheckCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cloudinaryAPI } from '../services/api';

const ImageUpload = ({ value, onChange, label }) => {
  const { t } = useTranslation();
  const defaultLabel = label || t('formBuilder.uploadImage', { defaultValue: 'Upload Image' });
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(t('formBuilder.uploadError', { defaultValue: 'Please select a valid image file.' }));
      return;
    }

    try {
      setUploading(true);
      const data = await cloudinaryAPI.uploadImage(file);
      onChange(data.secure_url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Ensure Cloudinary credentials are set in .env');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="space-y-3">
      {defaultLabel && <label className="form-label text-xs uppercase tracking-widest">{defaultLabel}</label>}
      
      {!value ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{ scale: isDragging ? 1.02 : 1 }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer h-40 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6
            ${isDragging 
              ? 'border-primary-500 bg-primary-50/30' 
              : 'border-gray-200 bg-white/60 hover:border-primary-400 hover:bg-white/80'
            } backdrop-blur-sm`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
            accept="image/*"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin relative z-10" />
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('system.uploading', { defaultValue: 'Uploading...' })}</span>
            </div>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                ${isDragging ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                <CloudUpload size={24} />
              </div>
              <p className="text-sm font-bold text-gray-700 tracking-tight">{t('formBuilder.dropFile', { defaultValue: 'Drop file or Click to upload' })}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">PNG, JPG or WebP {t('formBuilder.maxSize', { defaultValue: '(max. 10MB)' })}</p>
            </>
          )}
        </motion.div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white/80 shadow-glass group/preview">
          <img src={value} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white text-gray-900 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-primary-50"
            >
              <ImagePlus size={16} />
              {t('formBuilder.changeImage', { defaultValue: 'CHANGE IMAGE' })}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('')}
              className="p-3 bg-red-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-red-600"
            >
              <X size={16} />
              {t('formBuilder.removeImage', { defaultValue: 'REMOVE' })}
            </motion.button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
