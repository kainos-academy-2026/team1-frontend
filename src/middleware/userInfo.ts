import type { NextFunction, Request, Response } from 'express';
import * as jose from 'jose';
import { Role } from '../models/role.js';

function decodeToken(token: string): jose.JWTPayload | null {
	try {
		return jose.decodeJwt(token);
	} catch {
		return null;
	}
}

export default function userInfo(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.locals.user = null;
	//Get the token from the cookie in the request
	const token = req.cookies.token as string;

	//Check its not null or empty
	if (!token) {
		next();
		return;
	}

	if (token.length === 0) {
		next();
		return;
	}

	//Decode token and check expiry
	const decodedToken = decodeToken(token);
	if (!decodedToken) {
		res.cookie('token', null);
		next();
		return;
	}

	//Get the role stored in the token
	const role = decodedToken.role as Role;

	res.locals.user = {
		role: role,
		email: decodedToken.email as string,
		id: decodedToken.sub as string,
		isAuthenticated: true,
		isAdmin: role === Role.Admin,
	};

	next();
}
