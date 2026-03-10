# To-Do MERN

A full-stack task management application built with the **MERN** stack (MongoDB, Express, React, Node.js). Features JWT authentication, responsive UI, and a clean modern design.

---

## Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React 19 (Vite), Tailwind CSS 4, Axios, React Router 7 |
| Backend   | Node.js, Express 5, Mongoose 9, JWT, bcryptjs          |
| Database  | MongoDB (Atlas or local)                               |
| Auth      | JSON Web Tokens + bcrypt password hashing              |
| Security  | Helmet, express-rate-limit, CORS whitelist, HPP, mongo-sanitize |

---

## Features

- **User Authentication** — Register & login with JWT-based auth
- **CRUD Todos** — Create, read, update (toggle), and delete tasks
- **Protected Routes** — Unauthenticated users are redirected to login
- **Ownership Isolation** — Users can only see and manage their own todos
- **Toast Notifications** — Success/error feedback via react-hot-toast
- **Loading Spinners** — Visual feedback during async operations
- **Responsive Design** — Mobile-friendly layout with Tailwind CSS
- **Security Hardened** — Helmet, rate limiting, input sanitization, CORS whitelist

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local instance

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/todo-mern.git
cd todo-mern
```

### 2. Set Up Environment Variables

Copy the example files and fill in your own values:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

**server/.env**

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/todo-mern
JWT_SECRET=replace_with_a_strong_random_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**client/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application

Open two terminal windows:

```bash
# Terminal 1 — Start the backend
cd server
npm run dev
```

```bash
# Terminal 2 — Start the frontend
cd client
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## API Endpoints

| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register` | No   | Create a new user        |
| POST   | `/api/auth/login`    | No   | Login and receive JWT    |
| GET    | `/api/todos`         | Yes  | Get all todos for user   |
| POST   | `/api/todos`         | Yes  | Create a new todo        |
| PUT    | `/api/todos/:id`     | Yes  | Update a todo            |
| DELETE | `/api/todos/:id`     | Yes  | Delete a todo            |

---

## Project Structure

```
s4.1_To Do Mern/
├── client/                         # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js    # Axios config + token interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   │   │   ├── Spinner.jsx         # Reusable loading spinner
│   │   │   ├── TodoItem.jsx        # Single todo row
│   │   │   └── TodoList.jsx        # Todo list + add form
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Main todo dashboard
│   │   │   ├── LoginPage.jsx       # Login form
│   │   │   └── RegisterPage.jsx    # Register form
│   │   ├── App.jsx                 # Root component + routing
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind directives
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register & login logic
│   │   └── todoController.js       # Todo CRUD logic
│   ├── middleware/
│   │   └── verifyToken.js          # JWT verification
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Todo.js                 # Todo schema
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   └── todoRoutes.js           # Todo endpoints
│   ├── validators/
│   │   └── authValidator.js        # Input validation rules
│   ├── .env.example
│   ├── server.js                   # Express entry point
│   └── package.json
│
├── .gitignore
├── PROJECT_STRUCTURE.md
└── README.md
```

---

## Security

- **Helmet** — Secure HTTP headers (XSS, clickjacking, MIME sniffing)
- **Rate Limiting** — 10 requests per 15 minutes on auth endpoints
- **CORS Whitelist** — Only the frontend origin is allowed
- **Input Validation** — express-validator on all inputs
- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Expiration** — Tokens expire after 7 days
- **Ownership Checks** — Users can only access their own todos
- **NoSQL Injection Prevention** — express-mongo-sanitize
- **HPP Protection** — HTTP Parameter Pollution prevention
- **Generic Error Messages** — No stack traces or sensitive info leaked in production
- **Environment Variables** — All secrets stored in `.env` (git-ignored)

---

## Deployment

This project is deployed using **Render** (backend) and **Netlify** (frontend).

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   | Variable | Value |
   | -------- | ----- |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | `https://your-app.netlify.app` |

### Frontend — Netlify

1. Create a new site on [Netlify](https://www.netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
4. Add environment variable:
   | Variable | Value |
   | -------- | ----- |
   | `VITE_API_URL` | `https://your-app.onrender.com/api` |

> **Important:** After deploying both services, update `CLIENT_URL` on Render with your actual Netlify URL, and `VITE_API_URL` on Netlify with your actual Render URL. Then redeploy both.

---

## License

This project is for educational purposes as part of a GitHub Bootcamp.
