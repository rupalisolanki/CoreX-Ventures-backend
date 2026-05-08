import { Router } from 'express';
import { login, register, logout, getMe, updatePassword, getUsers, updateUser } from '../controllers/authController';
import { protect, restrictTo } from '../middleware/auth';
import { loginValidator, registerValidator } from '../middleware/validators';

const router = Router();

router.post('/login', loginValidator, login);
router.post('/logout', logout);

router.use(protect);
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

router.use(restrictTo('admin'));
router.post('/register', registerValidator, register);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);

export default router;
