import type { NextFunction, Request, Response } from 'express';
import * as jose from 'jose';
import type { Role } from '../models/role.js';

function decodeToken(token: string): jose.JWTPayload | null {
	try {
		return jose.decodeJwt(token);
	} catch {
		return null;
	}
}

export default function authoriseRoles(allowedRoles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		//Get the token from the cookie in the request
		const token = req.cookies.token as string;

		//Check its not null or empty
		if (!token) {
			res.redirect('/auth/login');
			return;
		}

		if (token.length === 0) {
			res.redirect('/auth/login');
			return;
		}

		//Decode token and check expiry
		const decodedToken = decodeToken(token);
		if (!decodedToken) {
			res.cookie('token', null);
			res.redirect('/auth/login');
			return;
		}

		//Get the role stored in the token
		const role = decodedToken.role as Role;

		//Check the role from the token is in the allowedRoles array
		if (!allowedRoles.includes(role)) {
			res.status(403);
			return;
		}

		next();
	};
}
