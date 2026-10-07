const { Server } = require('socket.io');

let ioInstance = null;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection established: ${socket.id}`);

    // Join personal user room for direct alerts
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined personal room user_${userId}`);
      }
    });

    // Donors join their blood group notification room (e.g. blood_A+, blood_O-)
    socket.on('join_blood_group', (bloodGroup) => {
      if (bloodGroup) {
        socket.join(`blood_${bloodGroup}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined blood room blood_${bloodGroup}`);
      }
    });

    // Join specific request tracking room for live status changes
    socket.on('join_request', (requestId) => {
      if (requestId) {
        socket.join(`request_${requestId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined request_${requestId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Connection disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

module.exports = { initSocket, getIO };
