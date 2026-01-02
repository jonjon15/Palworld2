import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponseServerIo } from '@/types/socket';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
  } else {
    console.log('Initializing Socket.IO server...');

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-map', () => {
        socket.join('map-room');
        console.log('Client joined map room:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  res.end();
}