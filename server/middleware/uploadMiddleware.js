import multer from 'multer';

// Use memory storage for Supabase uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  
  // Accept documents (PDF, Word, Excel, Text)
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'text/plain' ||
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/json'
  ) {
    cb(null, true);
    return;
  }

  cb(new Error('Invalid file type! Please upload an image or document (PDF, Word, Excel, Text, CSV).'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload; 