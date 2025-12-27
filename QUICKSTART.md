# Quick Start Guide

## Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js v14+ installed
- ✅ MySQL v5.7+ running
- ✅ MongoDB v4.4+ running

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
source database/mysql-schema.sql
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Test the API
- Health check: http://localhost:3000/health
- Import `postman-collection.json` into Postman
- Or use curl:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"user"}'

# Register an admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

## Default Test Accounts

After running the SQL schema, you'll have:

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**User Account:**
- Email: user@example.com
- Password: user123

Note: The passwords in the SQL file are hashed. Use the plaintext passwords above to login.

## Common Issues

### MySQL Connection Failed
- Check MySQL service is running
- Verify credentials in `.env`
- Ensure database `event_ticket_system` exists

### MongoDB Connection Failed
- Check MongoDB service is running
- Verify MONGODB_URI in `.env`
- Default: `mongodb://localhost:27017/event_ticket_system`

### Port Already in Use
- Change PORT in `.env` file
- Default is 3000

## API Testing Flow

1. **Register/Login** → Get JWT token
2. **Create Event** (Admin) → Get event ID
3. **Book Ticket** (User) → Use event ID
4. **View Bookings** → See your tickets
5. **Cancel Booking** → Cancel if needed

## Security Features Implemented

✅ **Input Validation** - Joi validation on all endpoints
✅ **Sanitization** - NoSQL injection prevention
✅ **Rate Limiting** - 100 requests/15min, 5 auth/15min
✅ **CORS** - Configurable allowed origins
✅ **Helmet** - Security headers
✅ **Password Hashing** - bcrypt with 10 rounds
✅ **JWT Auth** - Secure token-based authentication
✅ **No Sensitive Data** - Passwords never exposed in responses

## Project Highlights

🎯 **Dual Database Architecture**
- MySQL: Users & Bookings (ACID compliance)
- MongoDB: Events & Logs (flexible schema)

🔒 **Concurrency Handling**
- Atomic operations prevent race conditions
- Transaction rollback on failures
- Prevents double-booking of last ticket

📊 **Comprehensive Logging**
- All activities logged to MongoDB
- Error tracking and audit trail
- User action monitoring

## Next Steps

1. Test all endpoints with Postman collection
2. Review code architecture in README.md
3. Check security implementations
4. Test concurrent booking scenario
5. Review error handling

## Support

For issues or questions, refer to the detailed README.md file.
