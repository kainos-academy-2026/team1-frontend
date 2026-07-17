import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
	validateBody,
	validateJsonBody,
	validateParams,
} from '../src/middleware/validate';

const createResponse = () => ({
	locals: { errors: null as Record<string, string[]> | null },
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
});

describe('validateBody', () => {
	it('sets errors and calls next when body validation fails', () => {
		const middleware = validateBody(
			z.object({ email: z.string().email('Invalid email') }),
		);
		const req = { body: { email: 'invalid' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(res.locals.errors).toEqual({ email: ['Invalid email'] });
		expect(next).toHaveBeenCalled();
	});

	it('skips non-string field paths when collecting body errors', () => {
		const middleware = validateBody(z.string());
		const req = { body: {} };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(res.locals.errors).toEqual({});
		expect(next).toHaveBeenCalled();
	});

	it('writes parsed data to req.body and clears errors on success', () => {
		const middleware = validateBody(
			z.object({ email: z.string().trim().toLowerCase().email() }),
		);
		const req = { body: { email: ' Person@Example.com ' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(req.body).toEqual({ email: 'person@example.com' });
		expect(res.locals.errors).toBeNull();
		expect(next).toHaveBeenCalled();
	});
});

describe('validateParams', () => {
	it('returns 400 with structured errors when params validation fails', () => {
		const middleware = validateParams(
			z.object({ id: z.coerce.number().int() }),
		);
		const req = { params: { id: 'nope' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			errors: [
				{
					field: 'id',
					message: 'Invalid input: expected number, received NaN',
				},
			],
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('writes parsed params and calls next on success', () => {
		const middleware = validateParams(
			z.object({ id: z.coerce.number().int() }),
		);
		const req = { params: { id: '42' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(req.params).toEqual({ id: 42 });
		expect(next).toHaveBeenCalled();
	});
});

describe('validateJsonBody', () => {
	it('returns 400 with structured errors when JSON body validation fails', () => {
		const middleware = validateJsonBody(
			z.object({ fileName: z.string().min(1, 'File name is required') }),
		);
		const req = { body: { fileName: '' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			errors: [{ field: 'fileName', message: 'File name is required' }],
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('writes parsed JSON body and calls next on success', () => {
		const middleware = validateJsonBody(
			z.object({ email: z.string().trim().toLowerCase().email() }),
		);
		const req = { body: { email: ' Person@Example.com ' } };
		const res = createResponse();
		const next = vi.fn();

		middleware(req as never, res as never, next);

		expect(req.body).toEqual({ email: 'person@example.com' });
		expect(next).toHaveBeenCalled();
	});
});
