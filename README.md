# ✅ To-Do MERN

A full-stack task management application built with the **MERN** stack (MongoDB, Express, React, Node.js). Features JWT authentication, real-time toast notifications, responsive design, and a security-hardened backend.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

---

## Features

- **User Authentication** — Secure register and login system with JWT-based authentication and bcrypt password hashing
- **Full CRUD Operations** — Create, read, update (toggle complete), and delete tasks seamlessly
- **Protected Routes** — Unauthenticated users are automatically redirected to the login page
- **Ownership Isolation** — Users can only view and manage their own todos, enforced on both client and server
- **Toast Notifications** — Instant success and error feedback via react-hot-toast with a custom indigo theme
- **Loading States** — Visual feedback with reusable spinners during all async operations
- **Responsive Design** — Mobile-friendly layout built with Tailwind CSS 4
- **Security Hardened** — Helmet, rate limiting, CORS whitelist, input sanitization, HPP protection, and more
- **401 Auto-Handling** — Axios interceptor automatically clears auth state and redirects on expired tokens

---

## Live Demo

[🚀 View Live Demo](https://to-do-mernn.netlify.app)

---

## Technologies

### Frontend

- **React 19**: Modern UI library with hooks and context for state management
- **Vite 7**: Lightning-fast build tool and dev server
- **Tailwind CSS 4**: Utility-first CSS framework for rapid, responsive styling
- **React Router DOM 7**: Client-side routing with protected route support
- **Axios**: Promise-based HTTP client with interceptor support
- **react-hot-toast**: Lightweight toast notification library

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express 5**: Minimal and flexible web application framework
- **MongoDB (Mongoose 9)**: NoSQL database with elegant object modeling
- **JSON Web Tokens (JWT)**: Stateless authentication with 7-day token expiry
- **bcryptjs**: Secure password hashing with 12 salt rounds
- **express-validator**: Server-side input validation middleware
- **Helmet**: Secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
- **express-rate-limit**: Rate limiting for auth endpoints (10 req/15 min)
- **express-mongo-sanitize**: NoSQL injection prevention
- **HPP**: HTTP Parameter Pollution protection

---

## Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local instance

### Local Development

**1. Clone the repository:**

```bash
git clone https://github.com/Serkanbyx/s4.1_To-Do-Mern.git
cd s4.1_To-Do-Mern
```

**2. Set up environment variables:**

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

Configure `server/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/todo-mern
JWT_SECRET=replace_with_a_strong_random_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**3. Install dependencies:**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

**4. Run the application:**

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

## Usage

1. **Register** — Create an account with your name, email, and password
2. **Login** — Sign in with your credentials to access the dashboard
3. **Add Todo** — Type a task in the input field and press Enter or click the add button
4. **Toggle Complete** — Click the checkbox to mark a task as completed or incomplete
5. **Delete Todo** — Click the delete button to remove a task permanently
6. **Track Progress** — View the completed count to monitor your productivity
7. **Logout** — Click the logout button in the navigation bar to end your session

---

## How It Works?

### Authentication Flow

The application uses JWT-based authentication. When a user registers or logs in, the server generates a signed token that is stored in `localStorage`. Every subsequent API request includes this token in the `Authorization` header via an Axios interceptor:

```javascript
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Protected Routes

The `ProtectedRoute` component wraps authenticated pages. If no token exists in the auth context, the user is redirected to `/login`:

```jsx
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};
```

### Ownership Isolation

Every todo is linked to a `userId`. The backend filters todos by the authenticated user's ID and returns a `403 Forbidden` response if a user tries to modify another user's todo.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------------------- | ---- | ------------------------ |
| GET | `/` | No | Health check |
| POST | `/api/auth/register` | No | Create a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/todos` | Yes | Get all todos for user |
| POST | `/api/todos` | Yes | Create a new todo |
| PUT | `/api/todos/:id` | Yes | Update a todo |
| DELETE | `/api/todos/:id` | Yes | Delete a todo |

> **Auth** endpoints are rate-limited to **10 requests per 15 minutes**. Todo endpoints require a valid `Authorization: Bearer <token>` header.

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
│   │   │   ├── TodoItem.jsx        # Single todo row (memoized)
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
│   ├── netlify.toml
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
└── README.md
```

---

## Security

- **Helmet** — Secure HTTP headers protecting against XSS, clickjacking, and MIME sniffing
- **Rate Limiting** — 10 requests per 15 minutes on authentication endpoints
- **CORS Whitelist** — Only the configured frontend origin is allowed
- **Input Validation** — express-validator on all auth inputs with sanitization
- **Password Hashing** — bcrypt with 12 salt rounds for secure storage
- **JWT Expiration** — Tokens automatically expire after 7 days
- **Ownership Checks** — Users can only access and modify their own todos
- **NoSQL Injection Prevention** — express-mongo-sanitize cleans all user inputs
- **HPP Protection** — HTTP Parameter Pollution prevention middleware
- **Body Size Limit** — 10kb maximum for JSON and URL-encoded payloads
- **Generic Error Messages** — No stack traces or sensitive info leaked in production
- **Environment Variables** — All secrets stored in `.env` files (git-ignored)

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
| ------------ | ---------------------------------------- |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://to-do-mernn.netlify.app` |

### Frontend — Netlify

1. Create a new site on [Netlify](https://www.netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
4. Add environment variable:

| Variable | Value |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | `https://to-do-mern-1t0e.onrender.com/api` |

> **Important:** After deploying both services, update `CLIENT_URL` on Render with your actual Netlify URL, and `VITE_API_URL` on Netlify with your actual Render URL. Then redeploy both.

---

## Features in Detail

### Completed Features

- ✅ User registration with input validation
- ✅ User login with JWT authentication
- ✅ Protected routes with auto-redirect
- ✅ Create, read, update, and delete todos
- ✅ Toggle todo completion status
- ✅ Completed task counter
- ✅ Toast notifications for all actions
- ✅ Loading spinners for async operations
- ✅ Responsive mobile-friendly design
- ✅ Security hardening (Helmet, rate limit, sanitization)
- ✅ Axios interceptor for 401 auto-logout
- ✅ Memoized todo items for performance

### Future Features

- [ ] 🔮 Dark mode toggle
- [ ] 🔮 Drag-and-drop todo reordering
- [ ] 🔮 Todo categories and labels
- [ ] 🔮 Due dates and reminders
- [ ] 🔮 Search and filter todos
- [ ] 🔮 User profile management

---

## Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Commit Message Format

| Prefix | Description |
| ----------- | --------------------------------- |
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code refactoring |
| `docs:` | Documentation changes |
| `chore:` | Maintenance and dependency updates |

---

## License

This project is for educational purposes as part of a GitHub Bootcamp.

See the [LICENSE](LICENSE) file for more details.

---

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

---

## Acknowledgments

- [React](https://react.dev/) — UI library
- [Vite](https://vite.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Express](https://expressjs.com/) — Web framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database
- [Render](https://render.com/) — Backend hosting
- [Netlify](https://www.netlify.com/) — Frontend hosting

---

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s4.1_To-Do-Mern/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
