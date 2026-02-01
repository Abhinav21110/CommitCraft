import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service.js';
import { AuthenticatedRequest } from '../types/auth.types.js';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: No token provided. Header:', authHeader);
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = TokenService.verifyToken(token);

    if (!payload) {
      console.log('Auth failed: Invalid or expired token');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    console.log('Auth failed: Exception:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
