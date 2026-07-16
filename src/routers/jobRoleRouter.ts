import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { JobRoleController } from '../controllers/jobRoleController.js';
import authoriseRoles from '../middleware/authoriseRoles.js';
import { validateJobRoleId } from '../middleware/validateJobRoleId.js';
import { Role } from '../models/role.js';
import { ApiJobRoleService } from '../services/apiJobRoleService.js';

const router = Router();

const apiHttpClient = createApiHttpClient();
const jobRoleService = new ApiJobRoleService(apiHttpClient);
const jobRoleController = new JobRoleController(jobRoleService);

router.get(
	'/',
	authoriseRoles([Role.Admin, Role.User]),
	jobRoleController.getJobRoles,
);
router.get(
	'/:id',
	authoriseRoles([Role.Admin, Role.User]),
	validateJobRoleId,
	jobRoleController.getJobRole,
);

export default router;
