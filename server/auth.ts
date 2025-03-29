import express, { Request, Response, NextFunction } from 'express';
import { hash, verify } from 'argon2';
import { z } from 'zod';
import { loginSchema, insertUserSchema } from '@shared/schema';
import { storage } from './storage';
import session from 'express-session';

// Declare session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: express.Express) {
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };

  // Register a new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash the password
      const hashedPassword = await hash(userData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.format() });
      }
      console.error('Register error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  });

  // Login user
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Get user by username
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Verify password
      const isValidPassword = await verify(user.password, loginData.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Update last login timestamp
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Set user in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.format() });
      }
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  });

  // Logout user
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get current user
  app.get('/api/users/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ message: 'Server error retrieving user information' });
    }
  });

  // Get user's itineraries
  app.get('/api/itineraries/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const itineraries = await storage.getItinerariesByUserId(userId);
      return res.status(200).json(itineraries);
    } catch (error) {
      console.error('Get user itineraries error:', error);
      return res.status(500).json({ message: 'Server error retrieving itineraries' });
    }
  });

  // Update user profile
  app.patch('/api/users/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate input data (limited to specific fields)
      const updateSchema = z.object({
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        profilePicture: z.string().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.format() });
      }
      console.error('Update user error:', error);
      return res.status(500).json({ message: 'Server error updating user information' });
    }
  });

  // Update password
  app.post('/api/users/change-password', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate input data
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      });
      
      const passwordData = passwordSchema.parse(req.body);
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await verify(user.password, passwordData.currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hash(passwordData.newPassword);
      
      // Update password
      await storage.updateUser(userId, { password: hashedPassword });
      
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.format() });
      }
      console.error('Change password error:', error);
      return res.status(500).json({ message: 'Server error updating password' });
    }
  });

  return app;
}