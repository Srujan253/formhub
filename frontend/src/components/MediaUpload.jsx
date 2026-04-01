import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Paperclip, Loader2, X, FileText, ExternalLink } from 'lucide-react';
import { cloudinaryAPI } from '../services/api';

const MediaUpload = ({ mediaUrl, mediaType, onChange, label, compact = false }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert('Please select a valid image or PDF file.');
      return;
    }

    try {
      setUploading(true);
      const data = await cloudinaryAPI.uploadImage(file);
      onChange({
        mediaUrl: data.secure_url,
        mediaType: isPdf ? 'pdf' : 'image', // Ensure backend parses PDF vs Image
      });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Ensure Cloudinary credentials are set.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange({ mediaUrl: '', mediaType: '' });
  };

  return (
    <div className="space-y-3">
      {label && <label className="form-label text-xs uppercase tracking-widest">{label}</label>}

      {/* Button State */}
      {!mediaUrl && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-2 ${
            compact 
            ? 'p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors' 
            : 'px-4 py-2 border-2 border-dashed border-gray-200 bg-white/60 hover:border-primary-400 hover:bg-white/80 rounded-xl text-gray-500 font-medium'
          } backdrop-blur-sm`}
        >
          {uploading ? (
            <Loader2 size={compact ? 18 : 20} className="text-primary-500 animate-spin" />
          ) : (
            <>
              {compact ? <Paperclip size={18} /> : <ImageIcon size={20} />}
              {!compact && <span>Add Media (Image/PDF)</span>}
            </>
          )}
        </motion.button>
      )}

      {/* Preview State */}
      {mediaUrl && (
        <div className="relative group/preview inline-block max-w-full">
          {mediaType === 'pdf' ? (
            <div className="flex items-center gap-3 p-4 bg-white/80 border border-gray-100 rounded-xl shadow-lumina">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                <FileText size={24} />
              </div>
              <div className="flex flex-col pr-8">
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">Attached Document.pdf</span>
                <a 
                  href={mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  View Details <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white/80 shadow-lumina w-full sm:max-w-[400px]">
              <img src={mediaUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
            </div>
          )}
          
          <div className="absolute -top-2 -right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
            >
              <X size={14} />
            </motion.button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        accept="image/*,application/pdf"
      />
    </div>
  );
};

export default MediaUpload;