# FoodExpress

Online food ordering and delivery platform built with the **MEAN stack** (MongoDB, Express.js, Angular, Node.js).

Customers browse restaurants, fill a cart and place orders. Restaurant owners manage their menus and orders. An admin supervises the platform.

## Tech stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Frontend       | Angular + Bootstrap            |
| Backend        | Node.js + Express.js (REST API) |
| Database       | MongoDB + Mongoose             |
| Authentication | JWT + bcryptjs                 |
| Infrastructure | Docker + Docker Compose + nginx |

## Project structure

```
foodexpress/
├── backend/            # Express API (config, models, controllers, routes, middleware)
├── frontend/           # Angular app
├── infrastructure/     # Docker files
│   ├── docker-compose.yml
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   ├── nginx.conf
│   ├── .env            # NOT committed (you create it)
│   └── mongo-init/     # MongoDB init / seed scripts
├── .dockerignore
├── .gitignore
└── README.md
```

## Prerequisites

Install these before starting:

- [Node.js](https://nodejs.org/) 24 (LTS) or higher (`node -v` to check)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (`docker -v` to check)
- [Git](https://git-scm.com/)
- Angular CLI: `npm install -g @angular/cli`

## 1. Clone the project

```bash
git clone <repository-url>
cd foodexpress
```

## 2. Generate your JWT secret

The JWT secret is used to sign the authentication tokens. **Every developer generates their own secret locally.** Never share it and never commit it.

Run this in any terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

It prints a 128-character string like `9f3c...e1a7`. Copy it, you will need it in the next step.

## 3. Create the environment files

### `backend/.env` (for local development)

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/foodexpress
JWT_SECRET=paste_your_generated_secret_here
JWT_EXPIRES_IN=7d
```

### `infrastructure/.env` (for Docker)

```env
JWT_SECRET=paste_your_generated_secret_here
```

Use the **same secret** in both files, so tokens stay valid whether you run the app locally or in Docker.

> `.env` files are listed in `.gitignore`. If `git status` ever shows one, do not commit it.

## 4. Run the project in development mode (recommended)

In development, only MongoDB runs in Docker. Backend and frontend run locally with hot reload.

### 4.1 Start MongoDB

```bash
cd infrastructure
docker compose up -d mongo
```

Check that it is running with `docker ps` (container `foodexpress-mongo`).

### 4.2 Start the backend

```bash
cd backend
npm install
npm run dev
```

The API is available on http://localhost:3000.

### 4.3 Start the frontend

```bash
cd frontend
npm install
ng serve
```

The app is available on http://localhost:4200.

## 5. Run everything with Docker (production-like)

This builds and runs MongoDB, the backend and the frontend (served by nginx).

```bash
cd infrastructure
docker compose up --build
```

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost       |
| API      | http://localhost:3000  |
| MongoDB  | localhost:27017        |

Useful commands:

```bash
docker compose up -d          # start in the background
docker compose logs -f backend # follow the backend logs
docker compose down           # stop the containers (data is kept)
docker compose down -v        # stop AND delete the database data
```

## Backend scripts

| Command       | Description                           |
| ------------- | ------------------------------------- |
| `npm run dev` | Start the API with nodemon (hot reload) |
| `npm start`   | Start the API with node               |

## Troubleshooting

**`MongooseServerSelectionError: connect ECONNREFUSED`**
MongoDB is not running. Start it with `docker compose up -d mongo` from the `infrastructure/` folder.

**`JWT_SECRET is undefined` or `secretOrPrivateKey must have a value`**
Your `backend/.env` is missing or does not contain `JWT_SECRET`. Redo step 2 and 3.

**Port already in use (3000, 4200, 27017 or 80)**
Another program uses that port. Stop it, or change the port in the `.env` / `docker-compose.yml`.

**Init scripts in `mongo-init/` did not run**
They only run the first time the database volume is created. Run `docker compose down -v`, then start again (this deletes existing data).

**Frontend build fails with `dist/frontend/browser` not found**
Check the output path of your Angular build and adjust the `COPY --from=build` line in `infrastructure/frontend.Dockerfile`.

## Git workflow

- Never commit `.env` files or `node_modules`.
- Create one branch per feature (`feature/auth`, `feature/cart`, ...) and open a pull request into `main`.
- Pull the latest `main` before starting new work.

## Team

Project realized for the MEAN Stack course, 2026/2027.
