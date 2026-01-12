# Uniclips Backend - JavaScript Version

Plain JavaScript backend for Uniclips using Node.js and Express (no TypeScript, no AWS).

## Features

- ✅ Node.js + Express
- ✅ Plain JavaScript (CommonJS)
- ✅ MySQL database
- ✅ Local file storage (no AWS S3)
- ✅ Stripe payments
- ✅ JWT authentication
- ✅ Role-based authorization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- Stripe account (for payments)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Database credentials
   - JWT secret
   - Stripe keys

4. Set up your MySQL database with the required tables

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Key Differences from TypeScript Version

- **No TypeScript**: Pure JavaScript with CommonJS modules
- **No AWS S3**: Videos are stored locally in `uploads/` folder
- **No @aws-sdk**: Removed all AWS dependencies
- **Simpler setup**: No build step required

## Video Uploads

Videos are stored locally in the `uploads/` directory and served statically via `/uploads/:filename`.

## API Endpoints

All endpoints are the same as the TypeScript version:

- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/videos` - Video management
- `/api/subjects` - Subject management
- `/api/purchases` - Purchase management
- `/api/scholar-subjects` - Scholar subject requests

## License

ISC
