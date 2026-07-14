import axios from 'axios';
import { Router } from 'express';
import { requireApiBaseUrl } from '../config/requireApiBaseUrl.js';
import { JobRoleController } from '../controllers/jobRoleController.js';
import { validateParams } from '../middleware/validate.js';
import { jobRoleParamsSchema } from '../models/jobRoleParamsDto.js';
import { ApiJobRoleService } from '../services/apiJobRoleService.js';

const apiBaseUrl = requireApiBaseUrl();
const jobRoleService = new ApiJobRoleService(axios, apiBaseUrl);
const jobRoleController = new JobRoleController(jobRoleService);

const router = Router();

router.get('/', jobRoleController.getJobRoles);
router.get(
	'/:id',
	validateParams(jobRoleParamsSchema),
	jobRoleController.getJobRole,
);

export default router;
