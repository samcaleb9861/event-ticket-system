# Database Setup Instructions

## MySQL Setup

### Option 1: Using MySQL Command Line

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run the schema file
source database/mysql-schema.sql

# 3. Verify tables were created
USE event_ticket_system;
SHOW TABLES;
DESCRIBE users;
DESCRIBE bookings;

# 4. Exit MySQL
exit;
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "File" > "Run SQL Script"
4. Select `database/mysql-schema.sql`
5. Click "Run"

### Option 3: Manual Creation

```sql
CREATE DATABASE event_ticket_system;
USE event_ticket_system;

-- Copy and paste contents from mysql-schema.sql
```

## MongoDB Setup

### Option 1: MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database will be created automatically when the application runs

### Option 2: MongoDB Shell

```bash
# 1. Start MongoDB shell
mongosh

# 2. Switch to database (creates it if doesn't exist)
use event_ticket_system

# 3. Verify connection
db.getName()

# 4. Exit
exit
```

### Option 3: No Setup Required!

MongoDB database and collections will be created automatically when:
- The application first connects to MongoDB
- First event is created
- First log is written

## Verify Database Connections

### Test MySQL Connection

```bash
mysql -u root -p -e "USE event_ticket_system; SELECT COUNT(*) FROM users;"
```

### Test MongoDB Connection

```bash
mongosh --eval "use event_ticket_system; db.stats()"
```

## Environment Variables

Make sure your `.env` file has the correct database credentials:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=event_ticket_system
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/event_ticket_system
```

## Common Database Issues

### MySQL Issues

**Issue**: `ER_ACCESS_DENIED_ERROR`
```bash
# Solution: Check username and password in .env
# Or reset MySQL password
```

**Issue**: `ER_BAD_DB_ERROR`
```bash
# Solution: Database doesn't exist, run the schema file
mysql -u root -p < database/mysql-schema.sql
```

**Issue**: Port 3306 already in use
```bash
# Check if MySQL is running
# Windows:
Get-Service MySQL*

# Change port in .env if needed
MYSQL_PORT=3307
```

### MongoDB Issues

**Issue**: `MongoNetworkError`
```bash
# Solution: Start MongoDB service
# Windows:
net start MongoDB

# Or check if MongoDB is running
Get-Service MongoDB
```

**Issue**: Connection refused
```bash
# Check MongoDB is running on correct port
# Default is 27017
# Update MONGODB_URI in .env if using different port
```

## Database Collections/Tables

### MySQL Tables
- `users` - User accounts with authentication
- `bookings` - Ticket bookings linked to users

### MongoDB Collections
- `events` - Event details with flexible metadata
- `logs` - System activity logs

## Sample Data

After running `mysql-schema.sql`, you'll have:

**Default Admin:**
- Email: admin@example.com
- Password: admin123

**Default User:**
- Email: user@example.com
- Password: user123

Note: You can also create new accounts via the `/api/auth/register` endpoint.

## Database Indexes

### MySQL Indexes (Automatic)
- Primary keys on id fields
- Unique index on users.email
- Foreign key index on bookings.user_id
- Index on bookings.event_id

### MongoDB Indexes (Automatic)
- Index on events.date
- Index on events.createdBy
- Index on logs.timestamp
- Index on logs.userId

## Backup Recommendations

### MySQL Backup
```bash
mysqldump -u root -p event_ticket_system > backup.sql
```

### MongoDB Backup
```bash
mongodump --db event_ticket_system --out ./backup
```

## Reset Database (Development)

### Reset MySQL
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS event_ticket_system;"
mysql -u root -p < database/mysql-schema.sql
```

### Reset MongoDB
```bash
mongosh --eval "use event_ticket_system; db.dropDatabase()"
```

## Next Steps

After database setup:
1. ✅ Verify both databases are running
2. ✅ Update `.env` with correct credentials
3. ✅ Run `npm run dev` to start the server
4. ✅ Check health endpoint: http://localhost:3000/health
5. ✅ Start testing with Postman collection
