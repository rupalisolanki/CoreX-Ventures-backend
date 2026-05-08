import { Router } from 'express';
import { createContact, getContacts, getContact, updateContactStatus, deleteContact, getContactStats } from '../controllers/contactController';
import { protect, restrictTo } from '../middleware/auth';
import { contactValidator, listQueryValidator } from '../middleware/validators';

const router = Router();

router.post('/', contactValidator, createContact);

router.use(protect);
router.get('/stats', restrictTo('admin', 'manager'), getContactStats);
router.get('/', restrictTo('admin', 'manager'), listQueryValidator, getContacts);
router.get('/:id', restrictTo('admin', 'manager'), getContact);
router.patch('/:id/status', restrictTo('admin', 'manager'), updateContactStatus);
router.delete('/:id', restrictTo('admin'), deleteContact);

export default router;
