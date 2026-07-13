import { Router } from 'express';
import type { RegistrationController } from '../controllers/registrationController.js';

export const registrationRouter = (
	registrationController: RegistrationController,
): Router => {
	const router = Router();

	router.get('/', registrationController.getRegistrationForm);
	router.post('/', registrationController.register);

	return router;
};
