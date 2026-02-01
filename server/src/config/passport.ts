import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../lib/prisma.js';
import { TokenService } from '../services/token.service.js';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email', 'repo', 'write:repo_hook', 'read:org'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });

        if (user) {
          // Update existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              username: profile.username,
              email,
              avatarUrl: profile.photos?.[0]?.value,
              accessToken, // In production, encrypt this
              refreshToken: refreshToken || null,
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              githubId: profile.id,
              username: profile.username,
              email,
              avatarUrl: profile.photos?.[0]?.value,
              accessToken, // In production, encrypt this
              refreshToken: refreshToken || null,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
