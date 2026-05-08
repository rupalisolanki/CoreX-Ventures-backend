import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createInquiry, getInquiries, getInquiry, updateInquiry, deleteInquiry, getInquiryStats } from '../controllers/inquiryController';
import { protect, restrictTo } from '../middleware/auth';
import { inquiryValidator, listQueryValidator } from '../middleware/validators';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

const router = Router();

router.post('/', upload.array('attachments', 5), inquiryValidator, createInquiry);

router.use(protect);
router.get('/stats', restrictTo('admin', 'manager'), getInquiryStats);
router.get('/', restrictTo('admin', 'manager'), listQueryValidator, getInquiries);
router.get('/:id', restrictTo('admin', 'manager'), getInquiry);
router.patch('/:id', restrictTo('admin', 'manager'), updateInquiry);
router.delete('/:id', restrictTo('admin'), deleteInquiry);

export default router;
