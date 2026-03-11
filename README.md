> ⚡ Part of my 50 projects per language challenge — Project #3
> Depends on [FlashDB](https://github.com/ThejasRajamoney/key-value-store) running on port 3001

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
   - FlashDB running on port 3001

2. **Install Dependencies**
```bash
   npm install
```

3. **Configure Environment**
```env
   PORT=3002
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   FLASHDB_URL=http://localhost:3001
```

4. **Run the Server**
```bash
   npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get tokens |
| POST | `/auth/refresh` | Get new access token |
| POST | `/auth/logout` | Invalidate tokens |
| GET | `/protected/profile` | Protected route |
| GET | `/protected/dashboard` | Protected route |

## Security
- Passwords hashed with bcryptjs (salt rounds: 12)
- Access Token expires in 15 minutes
- Refresh Token expires in 7 days
- Logged out tokens blacklisted in FlashDB — cannot be reused
