import { Router } from 'express';
import { createApiHttpClient } from '../config/createApiHttpClient.js';
import { JobRoleController } from '../controllers/jobRoleController.js';
import { JobRoleMapper } from '../mappers/jobRoleMapper.js';
import { JobRoleViewMapper } from '../mappers/jobRoleViewMapper.js';
import authoriseRoles from '../middleware/authoriseRoles.js';
import { validateJobRoleId } from '../middleware/validateJobRoleId.js';
import { Role } from '../models/role.js';
import { ApiJobRoleService } from '../services/apiJobRoleService.js';

const router = Router();

const apiHttpClient = createApiHttpClient();
const jobRoleMapper = new JobRoleMapper();
const jobRoleViewMapper = new JobRoleViewMapper();
const jobRoleService = new ApiJobRoleService(apiHttpClient, jobRoleMapper);
const jobRoleController = new JobRoleController(
	jobRoleService,
	jobRoleViewMapper,
);

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
