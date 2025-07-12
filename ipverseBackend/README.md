# IPVerse Backend

IPVerse is a blockchain-based platform for IP (Intellectual Property) investment and management. This backend service provides APIs for both administrators and users to manage IP projects, investments, and user accounts.

## Project Overview

The platform enables:
- IP owners to tokenize their intellectual property
- Investors to purchase tokens of IP projects
- Administrators to manage projects and oversee platform operations

## Project Structure

```
ipverseBackend/
├── project/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── admin/                # Admin-specific controllers
│   │   └── user/                 # User-specific controllers
│   ├── middleware/
│   │   ├── verifyAdmin.js        # Admin authentication middleware
│   │   ├── verifyToken.js        # JWT verification middleware
│   │   └── verifyUser.js         # User authentication middleware
│   ├── models/
│   │   ├── Admin.js              # Admin model schema
│   │   ├── Investment.js         # Investment model schema
│   │   ├── Project.js            # Project model schema
│   │   └── User.js               # User model schema
│   ├── routes/
│   │   ├── admin/                # Admin routes
│   │   └── user/                 # User routes
│   └── server.js                 # Main application entry point
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

## API Endpoints

### Admin Routes

#### Authentication
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/profile` - Get admin profile
- `POST /api/admin/auth/create` - Create new admin
- `POST /api/admin/auth/logout` - Admin logout
- `PUT /api/admin/auth/profile` - Update admin profile

#### Projects
- `POST /api/admin/projects/createproject` - Create new project
- `GET /api/admin/projects/allprojectlist` - Get all projects
- `GET /api/admin/projects/analytics` - Get project analytics
- `GET /api/admin/projects/projectByid/:id` - Get project by ID
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project

### User Routes

#### Authentication
- `POST /api/user/auth/register` - User registration
- `POST /api/user/auth/login` - User login
- `GET /api/user/auth/profile` - Get user profile
- `PUT /api/user/auth/profile` - Update user profile

#### Investments
- `POST /api/user/investment` - Create new investment
- `GET /api/user/investment` - Get user investments
- `GET /api/user/investment/dashboard` - Get investment dashboard
- `GET /api/user/investment/:id` - Get investment details

## Project Features

### Admin Features
- Project management (CRUD operations)
- Project analytics and reporting
- Admin user management

### User Features
- User registration and authentication
- Investment management
- Investment portfolio tracking

### Security Features
- JWT-based authentication
- Role-based access control
- Input validation using express-validator
- Secure password handling

## Data Models

### Project
- Title
- Description
- Category (patent, trademark, copyright, trade_secret, other)
- IP Type (utility_patent, design_patent, trademark, copyright, trade_secret)
- Total Tokens
- Token Price
- Funding Goal
- End Date
- Expected Returns
- Risk Level

### Investment
- Project ID
- Tokens Invested
- Payment Method

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.