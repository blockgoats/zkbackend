import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  registerUser,
  loginUser,
  refreshToken,
  // logout
} from '../controllers/auth.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);
// router.post('/logout', authenticate, logout);

import passport from 'passport';

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
});


export { router as authRouter };

// curl http://localhost:4000/health
// curl -X POST http://localhost:4000/api/v1/auth/register \
// -H "Content-Type: application/json" \
// -d '{
//   "username": "alice",
//   "password": "SecurePass123",
//   "email": "alice@example.com"
// }'


// curl -X POST http://localhost:4000/api/v1/auth/login \
// -H "Content-Type: application/json" \
// -d '{
//   "username": "alice",
//   "password": "SecurePass123",
// }'



// curl -X POST http://localhost:4000/api/v1/auth/refresh \
// -H "Content-Type: application/json" \
// -d '{
//   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMHgyYjAxYjhiNDExMWU0NDYzMzY0MmE1MjI5OTE5OTlkMiIsInVzZXJuYW1lIjoiYWxpY2UiLCJpYXQiOjE3MzI4MTY3MDYsImV4cCI6MTczMjgyMDMwNn0.Vh6X35E6xtq9uBYzTX14JygeY2JvuEW7SMtUW0KiuVY"
// }'