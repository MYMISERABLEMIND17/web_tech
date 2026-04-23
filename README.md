# CampusLink (College LinkedIn)

Dark + neon UI refresh, GSAP route transitions, Swiper highlights, and a hero-only Three.js scene on auth pages.

## Run locally

### Server

```bash
cd server
npm install
npm run start
```

### Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production config

- **Client API base URL** is controlled by `VITE_API_BASE_URL` (see `client/.env.example`).\n
- Build with:

```bash
cd client
npm run build
```

# web_tech
