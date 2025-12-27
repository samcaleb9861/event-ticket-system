require('dotenv').config();
const app = require('./app');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { connectMySQL } = require('./config/mysql');
const connectMongoDB = require('./config/mongodb');

// Connect to databases
const startServer = async () => {
  try {
    // Connect to MySQL
    await connectMySQL();

    // Connect to MongoDB
    await connectMongoDB();

    // Routes
    app.use('/api', routes);

    // Health check route
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // Handle undefined routes
    app.all('*', (req, res, next) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    // Global error handling middleware
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
