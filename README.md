# 🐾 Beautiful Souls — Backend

REST API + real-time (Socket.IO) server for **Beautiful Souls**, an app that connects animal shelters and owners with adopters through swipe-based discovery and direct chat.

Frontend repo: [beautiful-sols-react](https://github.com/violetaatkinson/beautiful-sols-react)
Live API base: `https://<your-deployment>.vercel.app/api`

## 🛠 Tech stack

- [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose 6](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/) for real-time chat
- [JWT](https://github.com/auth0/node-jsonwebtoken) for authentication
- [bcrypt](https://www.npmjs.com/package/bcrypt) for password hashing
- [Cloudinary](https://cloudinary.com/) + [multer](https://www.npmjs.com/package/multer) for image uploads
- [morgan](https://www.npmjs.com/package/morgan) for request logging

## 📁 Project structure

```
├── app.js                  Express app + HTTP server + Socket.IO wiring
├── config/
│   ├── routes.config.js    All API routes
│   ├── db.config.js        MongoDB connection
│   ├── cloudinary.config.js Image upload storage (multer + Cloudinary)
│   └── socket.config.js    Socket.IO server: JWT auth handshake, per-user rooms, typing events
├── controllers/            Route handlers, one file per resource
├── middlewares/
│   └── auth.middleware.js  JWT verification, sets req.currentUser
├── models/                 Mongoose schemas (User, Pet, Like, Dislike, Message, Notification, Adopted)
├── services/
│   └── notificationService.js  Creates Notification documents
├── utils/
│   └── geo.js               Haversine distance calculation for "distance away"
├── scripts/
│   └── migrate-adoptions-to-pets.js  One-off data migration script
└── constants/
    └── defaults.js          Shared constants (default avatar, JWT secret)
```

## 🚀 Getting started

### Prerequisites

- Node.js 16+
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account (free tier is enough) for image uploads

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/beautifulSouls
JWT_SECRET=replace-with-a-long-random-string
CLOUDINARY_NAME=your-cloudinary-cloud-name
CLOUDINARY_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret
```

`JWT_SECRET` falls back to a hardcoded value if unset — **always set it explicitly in production**, since it's used to both sign and verify tokens (REST routes and the Socket.IO handshake share the same secret).

### Run

```bash
npm run dev     # nodemon, auto-restarts on change
npm start       # plain node
```

The API listens on `http://localhost:3001` (or `PORT`), mounted under `/api`.

### Migration script

```bash
npm run migrate:pets   # one-off: migrates legacy Adoption records into the Pet collection
```

## 📡 API routes

All routes are prefixed with `/api`. Routes marked 🔒 require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/login` | Log in, returns `{ accessToken }` |
| POST | `/users` | Register a new user (multipart, optional `image`) |
| GET | `/users` | 🔒 List all other users |
| GET | `/users/liked` | 🔒 Users interested in your pets, as `{ user, pet }` pairs |
| GET | `/users/me` | 🔒 Current user |
| PUT | `/users/:id` | 🔒 Edit your own profile (multipart, optional `image`) |
| DELETE | `/users/:id/delete` | 🔒 Delete your account |
| GET | `/profile` | 🔒 Pets you've liked |
| GET | `/adoptions` | 🔒 Swipe deck: available pets (excludes your own, already liked/disliked); `?lat=&lng=` for distance sorting |
| POST | `/adoptions/create` | 🔒 Create a pet listing (multipart, up to 4 `images`) |
| GET | `/adoptions/:id` | Pet detail |
| POST | `/adoptions/:id` | 🔒 Edit a pet you own |
| DELETE | `/adoptions/:id` | 🔒 Delete a pet you own |
| GET | `/myadoptions` | 🔒 Pets you've published |
| GET | `/adopted` | Community "Pet Stories" wall |
| POST | `/adopted/create` | 🔒 Share a pet story (multipart, optional `image`) |
| GET | `/like` | 🔒 List of pets you've liked |
| POST | `/like/:id` | 🔒 Toggle like on a pet |
| POST | `/dislike/:id` | 🔒 Dislike (pass on) a pet |
| GET | `/notifications` | 🔒 Your notifications (likes, messages, publish confirmations) |
| DELETE | `/notifications` | 🔒 Clear all your notifications |
| GET | `/chat/list` | 🔒 Your conversations, one per (other user, pet) |
| GET | `/chat/:userId/:petId` | 🔒 Message history for a specific conversation |
| POST | `/chat/create` | 🔒 Send a message (`{ receiver, pet, msg }`) |

## 🔌 Real-time chat (Socket.IO)

- The client authenticates the socket handshake with the same JWT used for REST calls (`io(url, { auth: { token } })`).
- Each connected user joins a room named after their own user id.
- On sending a message, the server emits `message:new` to both the sender's and receiver's rooms.
- Clients can emit `typing` (`{ to, pet }`) to show a live typing indicator to the other participant.

Conversations are always scoped to a specific **(user, pet)** pair — the `Message` model stores a `pet` reference alongside `sender`/`receiver`, so the same two people can have separate threads about different pets.

## 🗄 Data models (summary)

- **User** — auth + profile fields, `accountType` (`individual`/`shelter`), `shelterVerified`.
- **Pet** — species, traits, health, compatibility, `images[]`, `location` (with 2dsphere index for distance queries), `owner` ref.
- **Like** / **Dislike** — join tables between `User` and `Pet` (swipe history).
- **Message** — `sender`, `receiver`, `pet`, `msg`, timestamps.
- **Notification** — `type` (`Like` | `Message` | `Post`), `user` (who triggered it), `receiver`.
- **Adopted** — community story posts (`petName`, `image`, `content`).

## 🚢 Deployment

Deployed on [Vercel](https://vercel.com/). Make sure all environment variables above are set in the project settings, and that the frontend's `REACT_APP_API_URL` points at this deployment's `/api` base.
