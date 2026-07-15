import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { RegistrationController } from '../controllers/registrationController.js';
import { UserRequestMapper } from '../mappers/userRequestMapper.js';
import { setErrorRedirect } from '../middleware/errorRedirect.js';
import { validateBody } from '../middleware/validate.js';
import { ApiUserService } from '../services/apiUserService.js';
import { registrationCredentialsSchema } from '../validators/registrationCredentialsValidator.js';

const apiHttpClient = createApiHttpClient();
const userRequestMapper = new UserRequestMapper();
const userService = new ApiUserService(apiHttpClient, userRequestMapper);
const registrationController = new RegistrationController(userService);

const router = Router();

router.use(setErrorRedirect('/registration', 'Back to registration'));

router.get('/', registrationController.getRegistrationForm);
router.post(
	'/',
	validateBody(registrationCredentialsSchema),
	registrationController.register,
);

export default router;
