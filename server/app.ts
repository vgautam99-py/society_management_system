import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDb from './db/config.js';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import flatRoutes from './routes/flat.routes.js';
import UserRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import complaintRoutes from './routes/complaint.routes.js';
import noticeRoutes from './routes/notice.routes.js';
import billRoutes from './routes/bill.routes.js';
import payslipRoutes from './routes/payslip.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import path from 'path';
import notificationService from './lib/notificationService.js';
import { initBillingWorker } from './lib/billingWorker.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());

// Connect database
connectDb();

// Init billing worker
initBillingWorker();

app.use((req: any, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.send('Health is ok.');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', UserRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/flats', flatRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/payslips', payslipRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Initialize notification service
notificationService.init(io);

export const userConnectionDetails = notificationService.userConnectionDetails;

server.listen(3000, () => {
  console.log('✅ Server is running on port 3000');
});
