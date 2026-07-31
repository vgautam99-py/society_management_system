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
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = [
  'http://localhost:5173',
  'https://society-management-system-orpin.vercel.app',
  'https://society-management-system-55z47rjyc-acme-b043.vercel.app'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to avoid dropping request, but returning header
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost');
      callback(null, isAllowed);
    },
    credentials: true,
  },
});

app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(cors(corsOptions));

app.use(cookieParser());

// Connect database
connectDb();

// Init billing worker
initBillingWorker();

app.use((req: any, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
