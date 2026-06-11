# To-Do MERN — Step-by-Step Build Guide

> **Archived: original build playbook.** This document is the original roadmap used to build the To-Do MERN application from an empty folder to a deployed full-stack app. It is preserved as a making-of narrative; the codebase may have evolved since this guide was written. For the current setup, architecture, and deployment notes, always refer to [../README.md](../README.md).

---

> **Project Summary:** To-Do MERN is a full-stack task management application built on the MERN stack (MongoDB, Express, React, Node.js). Authenticated users register and log in via JWT-based stateless auth (bcrypt password hashing, 12 salt rounds, 7-day token expiry) and manage a private list of todos with full CRUD, inline editing, filter tabs (All / Active / Completed), and bulk "clear completed". The backend is security-hardened with Helmet, a CORS whitelist, auth rate limiting, a custom Express 5 compatible NoSQL sanitizer, HPP protection, a 10kb body limit, fail-fast environment validation, and ownership isolation enforced per request. The frontend is a Vite + React 19 SPA styled with Tailwind CSS 4, using React Context for auth state, an Axios interceptor for token injection and 401 auto-logout, and react-hot-toast for feedback.

Each step below is a self-contained prompt. Execute them in order.

Stack: MongoDB + Mongoose 9, Express 5, Node.js, React 19, Vite 7, Tailwind CSS 4, React Router DOM 7, Axios, JWT, bcryptjs, express-validator, Helmet, express-rate-limit, HPP, react-hot-toast.

---

## Table of Contents

**PHASE 1 — Backend Foundation**

- STEP 1 — Project Scaffolding & Dependency Setup
- STEP 2 — Environment Config & MongoDB Connection
- STEP 3 — Express App, Security Middleware & Error Handling

**PHASE 2 — Backend Resources**

- STEP 4 — User & Todo Mongoose Models
- STEP 5 — Validation Layer (Rules + Shared Handler)
- STEP 6 — Authentication (Controller, JWT, Routes, Rate Limiting)
- STEP 7 — JWT Verification Middleware & Todo CRUD

**PHASE 3 — Client Foundation**

- STEP 8 — Client Scaffolding (Vite + Tailwind)
- STEP 9 — Axios Instance & Interceptors
- STEP 10 — Auth Context, Hook & Token Utilities
- STEP 11 — Routing, Protected Routes & App Shell

**PHASE 4 — Client Pages**

- STEP 12 — Login & Register Pages
- STEP 13 — Navbar & Reusable Spinner
- STEP 14 — Todo Dashboard (TodoList + TodoItem)

**PHASE 5 — Polish & Deploy**

- STEP 15 — Toast Notifications & UX Polish
- STEP 16 — Deployment (Render + Netlify)

**Appendices**

- Appendix A — Shared Constants & Environment Variables
- Appendix B — API Endpoint Reference
- Appendix C — Common Pitfalls
- Appendix D — Pre-Flight Checklist

---

## Global Build Rules (apply to EVERY step)

- **No git operations.** Do not run `git` commands, do not commit, and do not push. Version control is handled manually by the user.
- Do not install unapproved packages. Only add the dependencies listed in the step you are executing.
- Do not run long-running processes (dev servers, watchers) unless the user explicitly requests it.
- Treat every step as self-contained: read the goal, create/edit only the listed files, then verify the acceptance checklist.
- Keep code clean, readable, and modern: ES6+, React Hooks, `async/await`. Prefer native methods over extra dependencies.
- Use English, descriptive, camelCase identifiers for functions and variables.
- Prioritize security, validation, accessibility (a11y), and performance in every layer.
- Never commit secrets. All credentials live in `.env` files that are git-ignored.

---

## Architecture at a Glance

```mermaid
flowchart LR
  subgraph Client["Client — React 19 SPA (Vite, Tailwind)"]
    UI["Pages & Components"]
    Ctx["AuthContext + useAuth"]
    Axios["axiosInstance<br/>(token + 401 interceptors)"]
    UI --> Ctx
    UI --> Axios
    Ctx --> Axios
  end

  subgraph Server["Server — Express 5 REST API"]
    CORS["CORS whitelist + Helmet + HPP<br/>+ NoSQL sanitizer"]
    Auth["/api/auth (rate limited)"]
    Todos["/api/todos (verifyToken)"]
    Ctrl["Controllers"]
    CORS --> Auth --> Ctrl
    CORS --> Todos --> Ctrl
  end

  DB[("MongoDB Atlas<br/>Mongoose 9")]

  Axios -- "HTTPS + Bearer JWT" --> CORS
  Ctrl --> DB
```

The client persists the JWT in `localStorage` and attaches it to every request via an Axios request interceptor. The server verifies the token, derives the `userId`, and scopes all todo queries to that user. A response interceptor on the client clears auth state and emits a logout event on `401`, letting the router redirect to `/login` without a full reload.

---

# PHASE 1 — BACKEND FOUNDATION

---

## STEP 1 — Project Scaffolding & Dependency Setup

**Goal:** Create the repository layout and initialize the Express backend with its dependencies.

**Files/folders to create:**

- `server/package.json`
- `server/.env.example`
- `.gitignore` (root)

**Dependencies (server):**

```bash
cd server
npm init -y
npm install express mongoose dotenv cors helmet hpp jsonwebtoken bcryptjs express-validator express-rate-limit
```

**Implementation notes:**

- Set `"type": "commonjs"` in `server/package.json`.
- Add scripts:
  - `"start": "node server.js"`
  - `"dev": "node --watch server.js"` (uses the native Node watcher; no nodemon needed).
- Root `.gitignore` must ignore `node_modules/`, `.env`, `dist/`, and editor/OS noise.
- Create `server/.env.example` documenting every variable (see Appendix A) with placeholder values only.

**Acceptance checklist:**

- [ ] `server/package.json` lists all dependencies and the two scripts.
- [ ] `.env` is git-ignored; `.env.example` is committed.
- [ ] `npm install` completes without errors.

---

## STEP 2 — Environment Config & MongoDB Connection

**Goal:** Centralize the database connection with a clean async connector and fail-fast behavior.

**Files to create:**

- `server/config/db.js`

**Implementation notes:**

- Export an async `connectDB` function that calls `mongoose.connect(process.env.MONGO_URI)`.
- On success, log the connected host. On failure, log the error message and call `process.exit(1)` so the process does not run half-initialized.
- Do not pass deprecated connection flags; Mongoose 9 needs none.

**Acceptance checklist:**

- [ ] `connectDB` resolves and logs the host with a valid `MONGO_URI`.
- [ ] An invalid URI logs a clear error and exits with code 1.

---

## STEP 3 — Express App, Security Middleware & Error Handling

**Goal:** Wire up the Express entry point with the full security stack, a health page, and a global error handler.

**Files to create:**

- `server/server.js`

**Implementation notes:**

- **Fail-fast env validation:** before creating the app, verify `MONGO_URI` and `JWT_SECRET` exist; if any are missing, log them and `process.exit(1)`.
- `app.set("trust proxy", 1)` so client IPs and rate limiting work behind Render/Netlify proxies.
- **CORS:** allow only the origin in `CLIENT_URL` (fallback `http://localhost:5173`) via an `origin` callback; enable `credentials`.
- **Helmet:** enable with `crossOriginResourcePolicy: "cross-origin"` and `crossOriginOpenerPolicy: "same-origin-allow-popups"`.
- **HPP:** enable to block HTTP parameter pollution.
- **Body parsers:** `express.json({ limit: "10kb" })` and `express.urlencoded({ extended: true, limit: "10kb" })`.
- **Custom NoSQL sanitizer:** add a middleware that recursively strips object keys starting with `$` or containing `.` from `req.body` and `req.headers`. This replaces `express-mongo-sanitize`, which is incompatible with Express 5's getter-only `req.query`.
- Mount routes: `app.use("/api/auth", authRoutes)` and `app.use("/api/todos", todoRoutes)` (created in later steps).
- Add a `GET /` health page (a small self-contained HTML response showing the API version from `package.json` and links to the live app and source).
- **Global error handler** (4-arg signature): respond with `err.statusCode || 500`; in production return a generic message and omit the stack, otherwise return `err.message` and `err.stack`.
- Start via an async `startServer` that awaits `connectDB()` then `app.listen(PORT)`.

**Acceptance checklist:**

- [ ] Server refuses to start when `JWT_SECRET` or `MONGO_URI` is missing.
- [ ] `GET /` returns the health page with the correct version.
- [ ] Requests from a non-whitelisted origin are rejected by CORS.

---

# PHASE 2 — BACKEND RESOURCES

---

## STEP 4 — User & Todo Mongoose Models

**Goal:** Define the data layer with schema-level validation and ownership linkage.

**Files to create:**

- `server/models/User.js`
- `server/models/Todo.js`

**Implementation notes:**

- **User schema:** `name` (required, trimmed, 2–50 chars), `email` (required, unique, lowercase, trimmed, regex-validated), `password` (required, min 6, `select: false` so it is never returned by default). Enable `timestamps`.
- **Todo schema:** `title` (required, trimmed, max 200), `completed` (Boolean, default `false`), `userId` (ObjectId ref `User`, required, `index: true` for fast per-user queries). Enable `timestamps`.

**Acceptance checklist:**

- [ ] Creating a user without required fields throws a validation error.
- [ ] `password` is excluded from query results unless explicitly selected.
- [ ] `Todo.userId` is indexed.

---

## STEP 5 — Validation Layer (Rules + Shared Handler)

**Goal:** Keep controllers free of validation boilerplate (DRY) using express-validator rule sets and one shared result handler.

**Files to create:**

- `server/validators/authValidator.js`
- `server/validators/todoValidator.js`
- `server/middleware/validate.js`

**Implementation notes:**

- `authValidator.js` exports `registerRules` (name: trim/escape/notEmpty/min 2; email: trim/notEmpty/isEmail/normalizeEmail; password: trim/notEmpty/min 6) and `loginRules` (email + password presence).
- `todoValidator.js` exports `createTodoRules` (title: `isString().bail().trim().notEmpty().isLength({ max: 200 })`) and `updateTodoRules` (title: same but `.optional()`; completed: `.optional().isBoolean().toBoolean()`).
- `validate.js` runs `validationResult(req)`; if not empty, respond `400` with `{ success: false, errors }`, otherwise call `next()`.
- Do not `escape()` todo titles — React escapes on render, and escaping would corrupt characters like `<`.

**Acceptance checklist:**

- [ ] Invalid auth/todo payloads return `400` with a structured `errors` array.
- [ ] Controllers contain no inline `validationResult` calls.

---

## STEP 6 — Authentication (Controller, JWT, Routes, Rate Limiting)

**Goal:** Implement register and login with hashing and signed tokens, protected by rate limiting.

**Files to create:**

- `server/controllers/authController.js`
- `server/routes/authRoutes.js`

**Implementation notes:**

- Constants: `SALT_ROUNDS = 12`, `JWT_EXPIRATION = "7d"`.
- **register:** reject duplicate email with `409`; hash password with bcrypt; create the user; sign a JWT `{ userId }`; return `201` with `{ success, token, user: { id, name, email } }`.
- **login:** fetch user with `.select("+password")`; compare with bcrypt; return a generic `401 "Invalid credentials"` for both unknown email and wrong password (no user enumeration); on success return the token and safe user fields.
- Wrap controller bodies in `try/catch` and forward errors with `next(error)`.
- **Routes:** define an `authLimiter` (`express-rate-limit`, 10 requests / 15 min, standard headers, custom JSON message). Chain middleware: `router.post("/register", authLimiter, registerRules, validate, register)` and the same pattern for `/login`.

**Acceptance checklist:**

- [ ] Registering a duplicate email returns `409`.
- [ ] Login failures always return the same generic `401`.
- [ ] The 11th auth request within 15 minutes is rate limited.

---

## STEP 7 — JWT Verification Middleware & Todo CRUD

**Goal:** Protect todo routes and implement per-user CRUD with ownership checks.

**Files to create:**

- `server/middleware/verifyToken.js`
- `server/controllers/todoController.js`
- `server/routes/todoRoutes.js`

**Implementation notes:**

- **verifyToken:** require an `Authorization: Bearer <token>` header; on missing/invalid token return `401 "Authentication required"`; on success attach `req.user = { userId: decoded.userId }` and call `next()`.
- **todoController:**
  - `getTodos` — find by `userId`, sort `createdAt: -1`, return `{ success, count, data }`.
  - `createTodo` — title is already validated/trimmed by `createTodoRules`; create with `req.user.userId`; return `201`.
  - `updateTodo` — validate `id` with `mongoose.Types.ObjectId.isValid`; `404` if not found; `403` if `todo.userId` ≠ requester; apply `title`/`completed` only when present; save and return.
  - `deleteTodo` — same id/ownership guards; `deleteOne`; return success.
  - `clearCompleted` — `deleteMany({ userId, completed: true })`; return the deleted count.
- **Routes:** `router.use(verifyToken)` first. **Order matters:** declare `DELETE /completed` BEFORE `/:id`, otherwise "completed" is parsed as an `:id`. Attach `createTodoRules`/`updateTodoRules` + `validate` to POST/PUT.

**Acceptance checklist:**

- [ ] Unauthenticated requests to `/api/todos` return `401`.
- [ ] A user cannot read or mutate another user's todo (`403`).
- [ ] `DELETE /api/todos/completed` clears only the caller's completed todos.

---

# PHASE 3 — CLIENT FOUNDATION

---

## STEP 8 — Client Scaffolding (Vite + Tailwind)

**Goal:** Bootstrap the React 19 SPA with Vite and Tailwind CSS 4.

**Files/folders to create:**

- `client/` (Vite React scaffold)
- `client/vite.config.js`
- `client/src/index.css`
- `client/.env.example`, `client/netlify.toml`

**Dependencies (client):**

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom react-hot-toast
npm install -D tailwindcss @tailwindcss/vite
```

**Implementation notes:**

- Configure `vite.config.js` with the `@vitejs/plugin-react` and `@tailwindcss/vite` plugins.
- In `src/index.css`, add the Tailwind 4 entry (`@import "tailwindcss";`).
- `client/.env.example` documents `VITE_API_URL` (e.g. `http://localhost:5000/api`).
- `netlify.toml` adds an SPA redirect (`/* -> /index.html 200`) so client routes resolve on refresh.

**Acceptance checklist:**

- [ ] `npm run dev` serves the app and Tailwind utility classes apply.
- [ ] `VITE_API_URL` is read from the environment.

---

## STEP 9 — Axios Instance & Interceptors

**Goal:** Centralize HTTP config with automatic token injection and session-expiry handling.

**Files to create:**

- `client/src/api/axiosInstance.js`

**Implementation notes:**

- Create an instance with `baseURL: import.meta.env.VITE_API_URL` and a JSON content-type.
- **Request interceptor:** read `token` from `localStorage`; if present, set `Authorization: Bearer <token>`.
- **Response interceptor:** on `401` **only when a token exists** (so login/register "invalid credentials" responses are left to the page), clear `token`/`user` from storage and dispatch a `window` event named `AUTH_LOGOUT_EVENT` (imported from `utils/token`). Do not force `window.location` navigation — the router handles redirect.

**Acceptance checklist:**

- [ ] Authenticated requests carry the Bearer token.
- [ ] A `401` on an authenticated request triggers the logout event; a `401` on login does not.

---

## STEP 10 — Auth Context, Hook & Token Utilities

**Goal:** Manage auth state with React Context, split files so Fast Refresh stays happy, and validate token expiry client-side.

**Files to create:**

- `client/src/utils/token.js`
- `client/src/context/auth-context.js`
- `client/src/context/AuthContext.jsx`
- `client/src/hooks/useAuth.js`

**Implementation notes:**

- `utils/token.js` exports `AUTH_LOGOUT_EVENT` and `isTokenExpired(token)` (decodes the JWT payload with `atob`, returns `true` when missing/malformed/past `exp`). The server remains the source of truth; this is only a UX guard.
- `context/auth-context.js` exports the `AuthContext` object (`createContext(null)`) — kept separate so provider and hook live in different modules.
- `context/AuthContext.jsx` exports the `AuthProvider` component **only**: initialize `token` from a valid stored token (clearing stale storage), expose `login`, `register`, `logout`, and `persistAuth` (all `useCallback`), memoize the context `value`, and add a `useEffect` listening for `AUTH_LOGOUT_EVENT` to clear state.
- `hooks/useAuth.js` exports `useAuth`, which reads the context and throws if used outside the provider.

**Acceptance checklist:**

- [ ] An expired token in storage does not grant access on load.
- [ ] `npm run lint` passes (no `react-refresh/only-export-components` error).

---

## STEP 11 — Routing, Protected Routes & App Shell

**Goal:** Assemble the router, guard private routes, and mount global providers.

**Files to create:**

- `client/src/main.jsx`
- `client/src/App.jsx`
- `client/src/components/ProtectedRoute.jsx`

**Implementation notes:**

- `main.jsx` wraps `<App />` in `StrictMode` → `BrowserRouter` → `AuthProvider`.
- `ProtectedRoute` reads `token` from `useAuth`; if absent, `<Navigate to="/login" replace />`, else render `children`.
- `App.jsx` renders the global `<Toaster />` (top-right, indigo success theme), the `<Navbar />`, and `<Routes>`: public `/login`, `/register`; protected `/` → `HomePage`; catch-all `*` → redirect to `/`.

**Acceptance checklist:**

- [ ] Visiting `/` while logged out redirects to `/login`.
- [ ] Unknown routes redirect to `/`.

---

# PHASE 4 — CLIENT PAGES

---

## STEP 12 — Login & Register Pages

**Goal:** Build accessible auth forms with client-side validation and clear error feedback.

**Files to create:**

- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`

**Implementation notes:**

- Controlled inputs via a single `formData` state object; clear errors on change.
- `LoginPage` calls `login(email, password)` from context; on success `toast.success` and `navigate("/", { replace: true })`; on failure surface `err.response?.data?.message` or the first validator error.
- `RegisterPage` runs a local `validate` (name ≥ 2, email regex, password ≥ 6) producing per-field errors before calling `register`.
- Accessibility: label every input with `htmlFor`/`id`, mark error containers with `role="alert"`, set proper `autoComplete` values, and disable submit while loading.

**Acceptance checklist:**

- [ ] Invalid input shows inline messages without hitting the API.
- [ ] Successful auth navigates to the dashboard and shows a toast.

---

## STEP 13 — Navbar & Reusable Spinner

**Goal:** Provide a session-aware top bar and a single loading primitive reused everywhere.

**Files to create:**

- `client/src/components/Navbar.jsx`
- `client/src/components/Spinner.jsx`

**Implementation notes:**

- `Spinner` accepts `size` (`sm`/`md`/`lg`) and `className`; render a spinning ring with `role="status"` and `aria-label="Loading"`.
- `Navbar` returns `null` when there is no token; otherwise shows the app name, the user's name (truncated on mobile), and a logout button that calls `logout`, toasts, and navigates to `/login`.

**Acceptance checklist:**

- [ ] Navbar is hidden on auth pages (no token).
- [ ] Logout clears state and redirects.

---

## STEP 14 — Todo Dashboard (TodoList + TodoItem)

**Goal:** Implement the core todo experience: fetch, add, toggle, inline-edit, delete, filter, and bulk-clear.

**Files to create:**

- `client/src/pages/HomePage.jsx`
- `client/src/components/TodoList.jsx`
- `client/src/components/TodoItem.jsx`

**Implementation notes:**

- `HomePage` greets the user (`user?.name`) and renders `<TodoList />`.
- `TodoList`:
  - Fetch todos on mount; manage `isLoading`, `isAdding`, `isClearing`, and a `filter` state (`all`/`active`/`completed`).
  - `handleAdd` POSTs and prepends the new todo; `handleToggle`/`handleEdit` replace by `_id`; `handleDelete` filters out; `handleClearCompleted` DELETEs `/todos/completed` and drops completed items.
  - Derive `completedCount` and `filteredTodos` with `useMemo`.
  - Render filter tabs, a `completed/total` counter, a conditional "Clear completed" action, and empty states.
- `TodoItem` (wrapped in `memo`, all handlers `useCallback`):
  - Checkbox toggles completion; double-click the title to inline-edit (focus the input, save on Enter/blur, cancel on Escape); delete button with hover affordance.
  - Use `aria-label`s for the toggle and delete controls.

**Acceptance checklist:**

- [ ] Add, toggle, edit, delete, filter, and clear-completed all work and stay in sync.
- [ ] Re-renders are minimized (memoized items, stable callbacks).

---

# PHASE 5 — POLISH & DEPLOY

---

## STEP 15 — Toast Notifications & UX Polish

**Goal:** Provide consistent, minimal feedback for every async action.

**Files to edit:**

- `client/src/App.jsx` (Toaster config) and the components that fire toasts.

**Implementation notes:**

- Configure one global `<Toaster />` with a 3s duration, rounded style, and an indigo success icon theme.
- Fire `toast.success`/`toast.error` from add/toggle/edit/delete/clear and auth flows. Keep messages short and human.
- Verify loading states (spinners, disabled buttons) cover every network call so the UI never looks frozen.

**Acceptance checklist:**

- [ ] Every mutation produces exactly one success or error toast.
- [ ] No action leaves a button enabled mid-request.

---

## STEP 16 — Deployment (Render + Netlify)

**Goal:** Ship the backend to Render and the frontend to Netlify with correct cross-origin config.

**Implementation notes:**

- **Backend (Render Web Service):** Root Directory `server`, Build `npm install`, Start `npm start`. Env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=<netlify-url>`.
- **Frontend (Netlify):** Base Directory `client`, Build `npm run build`, Publish `client/dist`. Env var: `VITE_API_URL=<render-url>/api`. The `netlify.toml` SPA redirect must be present.
- After both deploy, reconcile the cross-references: set `CLIENT_URL` on Render to the real Netlify URL and `VITE_API_URL` on Netlify to the real Render URL, then redeploy both.

**Acceptance checklist:**

- [ ] Production frontend can register/login and manage todos against the live API.
- [ ] CORS allows only the Netlify origin.

---

# Appendix A — Shared Constants & Environment Variables

**Server (`server/.env`):**

| Variable      | Example                                              | Notes                                  |
| ------------- | ---------------------------------------------------- | -------------------------------------- |
| `MONGO_URI`   | `mongodb+srv://user:pass@cluster.mongodb.net/todo`   | Required; validated at startup         |
| `JWT_SECRET`  | `a_long_random_secret`                               | Required; validated at startup         |
| `PORT`        | `5000`                                               | Optional; defaults to `5000`           |
| `NODE_ENV`    | `development` / `production`                         | Controls error verbosity               |
| `CLIENT_URL`  | `http://localhost:5173`                              | CORS whitelist origin                  |

**Client (`client/.env`):**

| Variable       | Example                       | Notes                          |
| -------------- | ----------------------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:5000/api`   | Base URL for the Axios client  |

**Code constants:** `SALT_ROUNDS = 12`, `JWT_EXPIRATION = "7d"`, auth rate limit `10 / 15 min`, body limit `10kb`, max todo title `200`, max name `50`, min password `6`.

---

# Appendix B — API Endpoint Reference

| Method | Endpoint                 | Auth | Description                  |
| ------ | ------------------------ | ---- | ---------------------------- |
| GET    | `/`                      | No   | Health check / version page  |
| POST   | `/api/auth/register`     | No   | Create a new user            |
| POST   | `/api/auth/login`        | No   | Login and receive a JWT      |
| GET    | `/api/todos`             | Yes  | List the user's todos        |
| POST   | `/api/todos`             | Yes  | Create a todo                |
| PUT    | `/api/todos/:id`         | Yes  | Update title and/or status   |
| DELETE | `/api/todos/completed`   | Yes  | Delete all completed todos   |
| DELETE | `/api/todos/:id`         | Yes  | Delete a single todo         |

Auth endpoints are rate limited (10 requests / 15 minutes). Todo endpoints require `Authorization: Bearer <token>`.

---

# Appendix C — Common Pitfalls

- **Route order:** `DELETE /api/todos/completed` must be declared before `/:id`, or Express treats `completed` as an id and returns "Invalid todo ID".
- **Express 5 + mongo-sanitize:** `express-mongo-sanitize` mutates `req.query`, which is getter-only in Express 5 and throws. Use the custom recursive sanitizer instead.
- **Fast Refresh lint:** a file exporting both a component and a non-component (hook/context) triggers `react-refresh/only-export-components`. Keep the context object, the provider, and the hook in three separate files.
- **401 over-handling:** redirecting on every `401` breaks login error messages. Only treat `401` as session expiry when a token is already stored.
- **trust proxy:** without `app.set("trust proxy", 1)`, rate limiting and client IPs are wrong behind Render/Netlify.
- **Empty/typed titles:** validate `title` as a non-empty string at the validator layer so an all-whitespace or non-string title cannot reach Mongoose and throw a 500.
- **Token leakage:** keep `password` as `select: false` and never return it; return only `{ id, name, email }`.

---

# Appendix D — Pre-Flight Checklist

- [ ] `server/.env` and `client/.env` exist and are git-ignored.
- [ ] `npm install` completes in both `server/` and `client/`.
- [ ] Backend boots, connects to MongoDB, and serves `GET /`.
- [ ] Register → login → CRUD works end to end locally.
- [ ] `npm run lint` passes in `client/`.
- [ ] `npm run build` succeeds in `client/`.
- [ ] CORS, rate limiting, and ownership checks verified.
- [ ] Production env vars set on Render and Netlify; cross-references reconciled.

---

Built as part of a GitHub Bootcamp. For current behavior, defer to [../README.md](../README.md).
