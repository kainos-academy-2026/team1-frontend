import { Router } from 'express';
import type { RegistrationController } from '../controllers/registrationController.js';
import { validateBody } from '../middleware/validate.js';
import { createUserRequestSchema } from '../models/userRequestDto.js';

export const registrationRouter = (
	registrationController: RegistrationController,
): Router => {
	const router = Router();

	router.get('/', registrationController.getRegistrationForm);
	router.post(
		'/',
		validateBody(createUserRequestSchema),
		registrationController.register,
	);

	return router;
};
