import { Router } from 'express';
import type { LoginController } from '../controllers/loginController.js';
import { redirectAuthenticatedUser } from '../middleware/auth.js';
import { setErrorRedirect } from '../middleware/errorRedirect.js';
import { validateLoginForm } from '../middleware/loginValidation.js';

export const loginRouter = (loginController: LoginController): Router => {
	const router = Router();
	router.use(setErrorRedirect('/login', 'Back to login'));

	router.get('/', redirectAuthenticatedUser, loginController.renderLoginPage);
	router.post('/', validateLoginForm, loginController.handleLogin);
	router.post('/logout', loginController.handleLogout);

	return router;
};
