import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers, deleteSubscriber } from '../controllers/newsletterController';
import { protect, restrictTo } from '../middleware/auth';
import { newsletterValidator, listQueryValidator } from '../middleware/validators';

const router = Router();

router.post('/subscribe', newsletterValidator, subscribe);
router.post('/unsubscribe', newsletterValidator, unsubscribe);

router.use(protect, restrictTo('admin'));
router.get('/', listQueryValidator, getSubscribers);
router.delete('/:id', deleteSubscriber);

export default router;
