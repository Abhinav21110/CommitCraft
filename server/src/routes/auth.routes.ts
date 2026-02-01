import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import { TokenService } from '../services/token.service.js';

const router = Router();

// Initiate GitHub OAuth
router.get('/github', passport.authenticate('github', { session: false }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${process.env.ALLOWED_ORIGINS}/login?error=auth_failed` 
  }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    
    if (!user) {
      res.redirect(`${process.env.ALLOWED_ORIGINS}/login?error=no_user`);
      return;
    }

    // Generate JWT token
    const token = TokenService.generateToken({
      userId: user.id,
      githubId: user.githubId,
      username: user.username,
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.ALLOWED_ORIGINS}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = TokenService.verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const prisma = (await import('../lib/prisma.js')).default;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout (client-side should remove token)
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
