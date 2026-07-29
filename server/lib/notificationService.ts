import { Server, Socket } from 'socket.io';

class NotificationService {
  io: Server | null;
  userConnectionDetails: Map<string, string>;

  constructor() {
    this.io = null;
    this.userConnectionDetails = new Map();
  }

  init(io: Server) {
    this.io = io;

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('register_user', (userId: string) => {
        if (userId) {
          this.userConnectionDetails.set(userId.toString(), socket.id);
          console.log(`User ${userId} registered on socket ${socket.id}`);
        }
      });

      socket.on('disconnect', () => {
        for (const [userId, socketId] of this.userConnectionDetails.entries()) {
          if (socketId === socket.id) {
            this.userConnectionDetails.delete(userId);
            console.log(`❌ User ${userId} disconnected`);
            break;
          }
        }
      });
    });
  }

  sendToUser(userId: any, event: string, data: any): boolean {
    if (!this.io) {
      console.error('NotificationService is not initialized.');
      return false;
    }
    const socketId = this.userConnectionDetails.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      console.log(`Emitted event "${event}" to user ${userId} via socket ${socketId}`);
      return true;
    }
    
    console.log(`User ${userId} is offline. Socket notification skipped.`);
    return false;
  }

  broadcast(event: string, data: any) {
    if (!this.io) {
      console.error('NotificationService is not initialized.');
      return;
    }

    this.io.emit(event, data);
    console.log(`Broadcasted event "${event}" to all connected users.`);
  }

  sendToUsers(userIds: any[], event: string, data: any) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
