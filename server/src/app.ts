import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import eventsRoutes from './routes/events.routes';
import meetsRoutes from './routes/meets.routes';
import friendsRoutes from './routes/friends.routes';
import messagesRoutes from './routes/messages.routes';
import socialRoutes from './routes/social.routes';
import uploadsRoutes from './routes/uploads.routes';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'scentra-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/me', meetsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api', messagesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/uploads', uploadsRoutes);

app.use(errorHandler);
