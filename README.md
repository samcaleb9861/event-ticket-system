# Event & Ticket System API

A RESTful API for an Event Management System built with Node.js, Express, MySQL, and MongoDB. The system demonstrates dual database architecture handling high-flexibility data (Events) in MongoDB and high-integrity transactional data (Users & Bookings) in MySQL.

## 🎯 Features

- **Dual Database Architecture**: MySQL for transactional data, MongoDB for flexible event data
- **JWT Authentication**: Secure user authentication and authorization
- **Role-Based Access Control**: User and Admin roles
- **Booking System**: Ticket booking with race condition prevention
- **Comprehensive Security**: Rate limiting, CORS, input validation, and sanitization
- **Transaction Management**: ACID compliance for critical operations
- **System Logging**: Activity tracking in MongoDB
- **Pagination**: Efficient data retrieval for events listing

## 🏗️ Architecture & Design Decisions

### Why Dual Database?

1. **MySQL for Users & Bookings**:
   - ACID compliance ensures booking integrity
   - Relational structure for user-booking relationships
   - Foreign key constraints prevent orphaned records
   - Perfect for transactional operations

2. **MongoDB for Events & Logs**:
   - Flexible schema for event metadata (guest speakers, tags, etc.)
   - Easy to add new fields without migrations
   - Efficient for read-heavy operations (event listings)
   - Natural fit for unstructured log data

### Concurrency Handling

The ticket booking system uses **optimistic locking** with MongoDB's `findOneAndUpdate` with atomic operations:
- Single atomic operation to check availability and decrement tickets
- Prevents double-booking race conditions
- Transaction rollback if booking creation fails

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd bd-assessment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source database/mysql-schema.sql

# Or manually:
CREATE DATABASE event_ticket_system;
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=event_ticket_system
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/event_ticket_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Start the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

## 🎫 Event Endpoints

### Get All Events

**GET** `/api/events`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `upcoming` (optional): Filter upcoming events (true/false)
- `search` (optional): Search by event title

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "data": {
    "events": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Tech Conference 2024",
        "description": "Annual tech conference",
        "date": "2024-12-31T10:00:00.000Z",
        "location": "Convention Center",
        "totalTickets": 100,
        "availableTickets": 75,
        "metadata": {
          "speakers": ["John Doe", "Jane Smith"],
          "tags": ["technology", "networking"]
        }
      }
    ]
  }
}
```

### Get Single Event

**GET** `/api/events/:id`

**Response:**
```json
{
  "status": "success",
  "data": {
    "event": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Tech Conference 2024",
      "description": "Annual tech conference",
      "date": "2024-12-31T10:00:00.000Z",
      "location": "Convention Center",
      "totalTickets": 100,
      "availableTickets": 75,
      "metadata": {}
    }
  }
}
```

### Create Event (Admin Only)

**POST** `/api/events`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual tech conference",
  "date": "2024-12-31T10:00:00.000Z",
  "location": "Convention Center",
  "totalTickets": 100,
  "metadata": {
    "speakers": ["John Doe", "Jane Smith"],
    "tags": ["technology", "networking"]
  }
}
```

### Update Event (Admin Only)

**PATCH** `/api/events/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "totalTickets": 150
}
```

### Delete Event (Admin Only)

**DELETE** `/api/events/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## 🎟️ Booking Endpoints

### Book a Ticket

**POST** `/api/bookings`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Ticket booked successfully",
  "data": {
    "booking": {
      "id": 1,
      "eventId": "507f1f77bcf86cd799439011",
      "eventTitle": "Tech Conference 2024",
      "eventDate": "2024-12-31T10:00:00.000Z",
      "bookingDate": "2024-01-15T14:30:00.000Z",
      "status": "confirmed"
    }
  }
}
```

### Get My Bookings

**GET** `/api/bookings/my-bookings`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "bookings": [
      {
        "bookingId": 1,
        "status": "confirmed",
        "bookingDate": "2024-01-15T14:30:00.000Z",
        "event": {
          "id": "507f1f77bcf86cd799439011",
          "title": "Tech Conference 2024",
          "description": "Annual tech conference",
          "date": "2024-12-31T10:00:00.000Z",
          "location": "Convention Center",
          "availableTickets": 75
        }
      }
    ]
  }
}
```

### Cancel Booking

**PATCH** `/api/bookings/:id/cancel`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": 1,
      "userId": 1,
      "eventId": "507f1f77bcf86cd799439011",
      "status": "cancelled"
    }
  }
}
```

---

## 🔒 Security Features

### Implemented Security Measures

1. **Input Validation & Sanitization**
   - Joi validation for all request bodies
   - Express-mongo-sanitize prevents NoSQL injection
   - Input length limits (10kb)

2. **Header Protection**
   - Helmet.js sets secure HTTP headers
   - XSS protection
   - Clickjacking prevention

3. **Access Control**
   - CORS configuration with whitelisted origins
   - JWT-based authentication
   - Role-based authorization

4. **Data Exposure Prevention**
   - Passwords hashed with bcrypt (10 rounds)
   - Password never returned in API responses
   - JWT secrets stored in environment variables

5. **Rate Limiting**
   - Global: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - Prevents brute-force attacks

## 🧪 Testing with Postman

Import the included Postman collection for quick API testing:

1. Open Postman
2. Import `postman-collection.json`
3. Set environment variables:
   - `base_url`: http://localhost:3000/api
   - `token`: (will be set automatically after login)

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "status": "fail",
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 📁 Project Structure

```
bd-assessment/
├── src/
│   ├── config/
│   │   ├── mysql.js           # MySQL connection
│   │   └── mongodb.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── bookingController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validateRequest.js # Input validation
│   ├── models/
│   │   ├── User.js            # MySQL model
│   │   ├── Booking.js         # MySQL model
│   │   ├── Event.js           # MongoDB model
│   │   ├── Log.js             # MongoDB model
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── index.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── catchAsync.js
│   │   └── logger.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── eventValidators.js
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── database/
│   └── mysql-schema.sql       # MySQL database schema
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## 📝 License

ISC

## 👤 Author

Backend Assessment Project

---

## 🎓 Key Learning Points

1. **Dual Database Integration**: Demonstrated ability to work with both SQL and NoSQL databases in a single application
2. **Transaction Management**: Implemented cross-database transactions ensuring data consistency
3. **Race Condition Handling**: Used atomic operations to prevent double-booking
4. **Security Best Practices**: Comprehensive security implementation following OWASP guidelines
5. **Clean Architecture**: Separation of concerns with MVC pattern
6. **Error Handling**: Robust error handling with proper logging
