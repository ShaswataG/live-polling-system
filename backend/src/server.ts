const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { attachSocket } = require('./ws/socket');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    // Attach Socket.IO
    const io = attachSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      logger.info(`HTTP + Socket server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully.');
      io.close(() => {
        server.close(() => {
          process.exit(0);
        });
      });
    });
  } catch (err) {
    const errorMessage = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    logger.error('Failed to start server: ' + errorMessage);
    process.exit(1);
  }
})();