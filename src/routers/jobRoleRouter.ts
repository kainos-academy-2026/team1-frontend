import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { JobRoleController } from '../controllers/jobRoleController.js';
import { setErrorRedirect } from '../middleware/errorRedirect.js';
import { validateParams } from '../middleware/validate.js';
import { jobRoleParamsSchema } from '../models/jobRoleParamsDto.js';
import { ApiJobRoleService } from '../services/apiJobRoleService.js';

const apiHttpClient = createApiHttpClient();
const jobRoleService = new ApiJobRoleService(apiHttpClient);
const jobRoleController = new JobRoleController(jobRoleService);

const router = Router();

router.use(setErrorRedirect('/', 'Back to home'));

router.get('/', jobRoleController.getJobRoles);
router.get(
	'/:id',
	validateParams(jobRoleParamsSchema),
	jobRoleController.getJobRole,
);

export default router;
