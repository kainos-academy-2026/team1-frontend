import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { LoginController } from '../controllers/loginController.js';
import { setErrorRedirect } from '../middleware/errorRedirect.js';
import { validateBody } from '../middleware/validate.js';
import { loginCredentialsSchema } from '../models/loginCredentials.js';
import { LoginService } from '../services/loginService.js';

const loginRouter = Router();
loginRouter.use(setErrorRedirect('/login', 'Back to login'));

const httpClient = createApiHttpClient();
const loginService = new LoginService(httpClient);
const loginController = new LoginController(loginService);

loginRouter.get('/login', loginController.renderLoginPage);
loginRouter.post(
	'/login',
	validateBody(loginCredentialsSchema),
	loginController.handleLogin,
);
loginRouter.post('/logout', loginController.handleLogout);

export default loginRouter;
