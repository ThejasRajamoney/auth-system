# Auth Token System (Node.js + FlashDB)

A complete authentication system built with Node.js and Express, using a separate FlashDB instance for token storage and blacklisting.

## Features
- JWT (JSON Web Tokens) for authentication
- bcryptjs for secure password hashing
- FlashDB for high-performance token storage and revocation
- Access & Refresh token rotation
- Middleware-protected routes

## Setup

1. **Prerequisites**
   - Node.js installed
   - FlashDB running on port 3001 (or as configured in .env)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Edit the `.env` file if necessary:
   ```env
   PORT=3002
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   FLASHDB_URL=http://localhost:3001
   ```

4. **Run the Server**
   ```bash
   # Production
   npm start

   # Development
   npm run dev
   ```

## API Endpoints

### Auth Endpoints

#### Register
`POST /auth/register`
```bash
curl -X POST http://localhost:3002/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

#### Login
`POST /auth/login`
```bash
curl -X POST http://localhost:3002/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```

#### Refresh Token
`POST /auth/refresh`
```bash
curl -X POST http://localhost:3002/auth/refresh \
-H "Content-Type: application/json" \
-d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

#### Logout
`POST /auth/logout`
```bash
curl -X POST http://localhost:3002/auth/logout \
-H "Content-Type: application/json" \
-d '{"accessToken": "YOUR_ACCESS_TOKEN", "refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Protected Endpoints

#### User Profile
`GET /protected/profile`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:3002/protected/profile
```

#### Dashboard
`GET /protected/dashboard`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:3002/protected/dashboard
```

## Security Implementation
- **Passwords**: Hashed with bcryptjs (salt rounds: 12).
- **Tokens**: 
  - Access Token (15m TTL)
  - Refresh Token (7d TTL)
- **Revocation**: Tokens are blacklisted in FlashDB on logout to prevent reuse before expiration.
- **Verification**: Middleware checks FlashDB for every protected request to ensure the token exists and hasn't been revoked.
