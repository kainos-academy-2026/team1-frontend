import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { LoginController } from '../controllers/loginController.js';
import { validateBody } from '../middleware/validate.js';
import { LoginService } from '../services/loginService.js';
import { loginCredentialsSchema } from '../validators/loginCredentialsValidator.js';

const apiHttpClient = createApiHttpClient();
const loginService = new LoginService(apiHttpClient);
const loginController = new LoginController(loginService);

const router = Router();

router.get('/', loginController.renderLoginPage);
router.post(
	'/',
	validateBody(loginCredentialsSchema),
	loginController.handleLogin,
);

export default router;
