This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Login / Signup / Logout Setup

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**

### 1. Start the Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn auth:app --reload --port 8000
```

API server starts at `http://localhost:8000`.

### 2. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

UI starts at `http://localhost:3000`.

### 3. Use It

1. Open `http://localhost:3000` in your browser
2. You'll land on the **Login** page — click **Sign up**
3. Create an account with any username and password
4. You'll be redirected to the **Dashboard**
5. Click **Log out** to end your session

**Note:** User data is stored in memory — it resets when you restart the backend.

### How It Works

```
Browser (Next.js :3000)  ──HTTP──>  Python API (FastAPI :8000)  ──>  In-Memory Dict
```

**Architecture:** The frontend (Next.js) sends HTTP requests to the backend (FastAPI). The backend stores users in a Python dictionary and uses JWT tokens to track who's logged in.

**Signup flow:**
1. User submits username + password on the `/signup` page
2. Frontend sends `POST /signup` to the backend
3. Backend hashes the password (SHA-256) and stores `{username: hashed_password}` in a dict
4. Backend creates a JWT token containing the username + expiry (1 hour) and returns it
5. Frontend saves the token in `localStorage` and redirects to `/dashboard`

**Login flow:**
1. User submits credentials on the `/login` page
2. Frontend sends `POST /login` to the backend
3. Backend looks up the username, hashes the submitted password, and compares it to the stored hash
4. If they match, a new JWT token is created and returned
5. Frontend saves the token and redirects to `/dashboard`

**Dashboard (protected page):**
1. On page load, frontend reads the token from `localStorage`
2. Sends `GET /me` with the token in the `Authorization: Bearer <token>` header
3. Backend decodes the JWT, verifies it hasn't expired, and returns the username
4. If the token is missing or invalid, the user is redirected back to `/login`

**Logout:**
1. Frontend deletes the token from `localStorage` — no backend call needed
2. User is redirected to `/login`

**CORS:** The backend allows requests from `http://localhost:3000` so the browser doesn't block cross-origin calls between the two ports.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
