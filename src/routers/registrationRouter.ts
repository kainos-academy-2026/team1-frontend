import axios from 'axios';
import { Router } from 'express';
import { requireApiBaseUrl } from '../config/requireApiBaseUrl.js';
import { RegistrationController } from '../controllers/registrationController.js';
import { UserRequestMapper } from '../mappers/userRequestMapper.js';
import { validateBody } from '../middleware/validate.js';
import { createUserRequestSchema } from '../models/userRequestDto.js';
import { ApiUserService } from '../services/apiUserService.js';

const apiBaseUrl = requireApiBaseUrl();
const userRequestMapper = new UserRequestMapper();
const userService = new ApiUserService(axios, apiBaseUrl, userRequestMapper);
const registrationController = new RegistrationController(userService);

const router = Router();

router.get('/', registrationController.getRegistrationForm);
router.post(
	'/',
	validateBody(createUserRequestSchema),
	registrationController.register,
);

export default router;
