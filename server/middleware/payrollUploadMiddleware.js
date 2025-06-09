import multer from 'multer';

// Use memory storage since we'll upload to Supabase
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only PDF files for payroll documents
  const allowedTypes = ['application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed for payroll documents.'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB limit
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits 
});

export default upload; 