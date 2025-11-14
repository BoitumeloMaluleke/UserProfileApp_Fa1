# UserProfileApp

A full-stack user profile management application with authentication and profile updates.

## Features

- User registration and login
- JWT-based authentication
- Profile management (email, phone, date of birth)
- Real-time form validation
- Secure password hashing with bcrypt

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB

## Local Development

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/UserProfileApp.git
cd UserProfileApp
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create `.env` file in `backend/` folder:
```
MONGO_URI=mongodb://localhost:27017/userprofileapp
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=5000
```

4. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

5. Open browser to `http://localhost:5000`

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed Azure deployment instructions.

## Project Structure

```
UserProfileApp/
├── backend/
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── db.js            # Database connection
│   └── server.js        # Express server
├── frontend/
│   ├── scripts/         # Frontend JavaScript
│   ├── *.html           # HTML pages
│   └── styles.css       # Styling
└── package.json         # Root package.json for Azure

```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user profile (requires auth)

## License

ISC


