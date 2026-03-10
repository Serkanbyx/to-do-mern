# To-Do MERN — Full-Stack Project Structure & Prompt Plan

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React (Vite), TailwindCSS, Axios, React Router  |
| Backend    | Node.js, Express, Mongoose, JWT, bcryptjs        |
| Database   | MongoDB (Atlas or local)                         |
| Auth       | JSON Web Tokens + bcrypt password hashing        |
| Security   | Helmet, express-rate-limit, CORS whitelist, hpp   |

---

## Security Checklist (Public GitHub Repo)

- [x] **`.env` files NEVER committed** — only `.env.example` with dummy values
- [x] **`.gitignore`** covers `.env`, `node_modules/`, `dist/`, OS files
- [x] **Helmet** — sets secure HTTP headers (XSS, clickjacking, MIME sniffing)
- [x] **Rate limiting** — prevents brute-force attacks on auth endpoints
- [x] **CORS whitelist** — only allow requests from the frontend origin
- [x] **Input validation & sanitization** — express-validator on all inputs
- [x] **Password hashing** — bcrypt with salt rounds (min 10)
- [x] **JWT expiration** — tokens expire (e.g. 7d), no sensitive data in payload
- [x] **Ownership checks** — users can only access/modify their own todos
- [x] **No secrets in code** — all credentials via environment variables
- [x] **MongoDB injection prevention** — Mongoose sanitizes by default + mongo-sanitize
- [x] **HPP** — HTTP Parameter Pollution protection
- [x] **Error handling** — generic error messages in production, no stack traces leaked

---

## Folder Structure (Final)

```
s4.1_To Do Mern/
├── client/                         # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js    # Axios base config + token interceptor
│   │   ├── components/
│   │   │   ├── TodoItem.jsx        # Single todo row (checkbox, delete btn)
│   │   │   ├── TodoList.jsx        # Todo list + add form
│   │   │   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   │   │   └── Navbar.jsx          # Top navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management (token, user)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Login form
│   │   │   ├── RegisterPage.jsx    # Register form
│   │   │   └── HomePage.jsx        # Main todo dashboard
│   │   ├── App.jsx                 # Root component + routing
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind directives
│   ├── .env                        # VITE_API_URL (git-ignored)
│   ├── .env.example                # Safe placeholder for contributors
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # register, login logic
│   │   └── todoController.js       # CRUD logic for todos
│   ├── middleware/
│   │   └── verifyToken.js          # JWT verification middleware
│   ├── models/
│   │   ├── User.js                 # User schema (name, email, password)
│   │   └── Todo.js                 # Todo schema (title, completed, userId)
│   ├── routes/
│   │   ├── authRoutes.js           # POST /register, POST /login
│   │   └── todoRoutes.js           # GET, POST, PUT, DELETE /api/todos
│   ├── validators/
│   │   └── authValidator.js        # Express-validator rules
│   ├── .env                        # MONGO_URI, JWT_SECRET, PORT (git-ignored)
│   ├── .env.example                # Safe placeholder for contributors
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── PROJECT_STRUCTURE.md            # This file
└── .gitignore
```

---

## Prompt Plan (Step-by-Step)

### Phase 1 — Project Initialization

> **Prompt 1:** Initialize the project. Create a `server/` folder with `npm init -y`,
> install `express`, `mongoose`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`,
> `express-validator`, `helmet`, `express-rate-limit`, `hpp`, and `express-mongo-sanitize`.
> Create the `server/server.js` entry point with a basic Express server that:
> - Connects to MongoDB using a config file
> - Uses `helmet()` for secure HTTP headers
> - Uses `hpp()` for HTTP parameter pollution protection
> - Uses `mongoSanitize()` to prevent NoSQL injection
> - Configures CORS with a whitelist (only frontend origin allowed)
> - Has a global error handler that hides stack traces in production
>
> Create `server/.env` with real placeholders and `server/.env.example` with
> dummy safe values (this is the only env file that gets committed).
> Set up a comprehensive `.gitignore` at the project root that covers:
> `.env`, `node_modules/`, `dist/`, `.DS_Store`, `Thumbs.db`, `*.log`.

---

### Phase 2 — Database Models

> **Prompt 2:** Create Mongoose models inside `server/models/`.
> - `User.js` — fields: `name` (String, required), `email` (String, required,
>   unique), `password` (String, required). Add timestamps.
> - `Todo.js` — fields: `title` (String, required), `completed` (Boolean,
>   default false), `userId` (ObjectId ref to User, required). Add timestamps.
> Write clean, RESTful-ready schemas with proper validation.

---

### Phase 3 — Auth System (Register & Login)

> **Prompt 3:** Build the authentication system.
> - Create `server/validators/authValidator.js` with express-validator rules for
>   register (name min 2 chars, email valid format, password min 6 chars) and
>   login (email, password). Sanitize inputs (trim, normalizeEmail, escape).
> - Create `server/controllers/authController.js` with `register` and `login`
>   functions. Hash passwords with bcryptjs (salt rounds: 12), return JWT on
>   success with expiration (7d). Never return the password field in responses.
>   Use generic error messages (e.g. "Invalid credentials" — don't reveal
>   whether email or password is wrong).
> - Create `server/routes/authRoutes.js` with `POST /register` and `POST /login`.
>   Apply rate limiting on auth routes (max 10 requests per 15 min per IP).
> - Wire routes into `server.js` under `/api/auth`.

---

### Phase 4 — JWT Middleware

> **Prompt 4:** Create `server/middleware/verifyToken.js`. This middleware should:
> - Extract the token from the `Authorization: Bearer <token>` header.
> - Verify it using `jsonwebtoken` with the secret from env.
> - Attach the decoded `userId` to `req.user`.
> - Return 401 with a generic message if token is missing, expired, or invalid.
> - Never expose token details or error specifics in the response.

---

### Phase 5 — Todo CRUD Routes

> **Prompt 5:** Build full CRUD for todos (all routes require authentication).
> - Create `server/controllers/todoController.js` with: `getTodos` (user's
>   todos only), `createTodo`, `updateTodo`, `deleteTodo`.
> - Create `server/routes/todoRoutes.js` mapping:
>   `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`.
> - Apply `verifyToken` middleware to all todo routes.
> - Wire into `server.js` under `/api/todos`.
> - Add ownership checks: users can only modify their own todos.

---

### Phase 6 — Frontend Initialization

> **Prompt 6:** Create the React frontend using Vite.
> Run `npm create vite@latest client -- --template react` inside the project root.
> Install `axios`, `react-router-dom`. Set up TailwindCSS (install + config files).
> Clean up default Vite boilerplate. Create the folder structure:
> `src/api/`, `src/components/`, `src/context/`, `src/pages/`.
> Create `client/.env` with `VITE_API_URL=http://localhost:5000/api`.
> Create `client/.env.example` with the same key but a placeholder value.

---

### Phase 7 — Axios Instance & Auth Context

> **Prompt 7:** Set up the API layer and auth state management.
> - Create `src/api/axiosInstance.js`: base URL from env, request interceptor
>   that attaches the JWT token from localStorage to every request.
>   Add a response interceptor that catches 401 errors and auto-logouts
>   (clears token, redirects to login) when the token expires.
> - Create `src/context/AuthContext.jsx`: React Context + Provider that manages
>   `user`, `token`, `login()`, `register()`, `logout()` functions.
>   Store token in localStorage. Expose via `useAuth()` custom hook.
>   On `logout()`, clear all auth data from localStorage.

---

### Phase 8 — Auth Pages (Login & Register)

> **Prompt 8:** Build the authentication UI pages.
> - Create `src/pages/LoginPage.jsx`: email + password form, calls `login()`
>   from AuthContext, redirects to home on success, shows error messages.
> - Create `src/pages/RegisterPage.jsx`: name + email + password form, calls
>   `register()` from AuthContext, redirects to home on success.
> - Both pages should have a clean, minimal TailwindCSS design with proper
>   form validation feedback.

---

### Phase 9 — Protected Route & Navbar

> **Prompt 9:** Create route protection and navigation.
> - Create `src/components/ProtectedRoute.jsx`: if no token exists, redirect
>   to `/login`. Otherwise render the child route.
> - Create `src/components/Navbar.jsx`: shows app title, user's name, and a
>   logout button. Only visible when authenticated.
> - Set up React Router in `App.jsx` with routes:
>   `/login`, `/register`, `/` (protected → HomePage).

---

### Phase 10 — Todo Components & Home Page

> **Prompt 10:** Build the main todo functionality.
> - Create `src/components/TodoItem.jsx`: displays title, checkbox to toggle
>   completed state, delete button. Uses Axios to call PUT/DELETE endpoints.
> - Create `src/components/TodoList.jsx`: fetches all todos on mount, renders
>   TodoItem list, includes an input + button to add new todos.
> - Create `src/pages/HomePage.jsx`: wraps TodoList, shows welcome message
>   with user's name. Clean, modern TailwindCSS layout.

---

### Phase 11 — Final Polish & Testing

> **Prompt 11:** Final review and polish.
> - Add loading spinners for async operations.
> - Add toast/notification for success/error feedback.
> - Ensure responsive design (mobile-friendly).
> - Test full flow: register → login → add todo → toggle → delete → logout.
> - Verify protected routes redirect properly when unauthenticated.
> - Security audit: ensure no secrets in code, `.env` is git-ignored,
>   error messages are generic, CORS is strict, rate limits work.
> - Create a professional `README.md` with setup instructions, screenshots
>   section, tech stack, and a note about creating `.env` from `.env.example`.

---

## API Endpoints Summary

| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| POST   | /api/auth/register   | No   | Create new user account  |
| POST   | /api/auth/login      | No   | Login and receive JWT    |
| GET    | /api/todos           | Yes  | Get all todos for user   |
| POST   | /api/todos           | Yes  | Create a new todo        |
| PUT    | /api/todos/:id       | Yes  | Update a todo            |
| DELETE | /api/todos/:id       | Yes  | Delete a todo            |

---

## Environment Variables

> **IMPORTANT:** `.env` files are **git-ignored** and never committed.
> Only `.env.example` files are committed with safe placeholder values.

### server/.env.example (committed to Git)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-mern
JWT_SECRET=replace_with_a_strong_random_secret
PORT=5000
```

### client/.env.example (committed to Git)
```
VITE_API_URL=http://localhost:5000/api
```

### Setup for contributors
```bash
# Copy example files and fill in real values
cp server/.env.example server/.env
cp client/.env.example client/.env
```
