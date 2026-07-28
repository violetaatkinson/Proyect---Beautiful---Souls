<h1 align="center">🐾 Beautiful Souls — API</h1>

<p align="center">
  <strong>REST API + real-time server for Beautiful Souls.</strong>
</p>

<p align="center">
  A <strong>Node.js / Express</strong> backend with <strong>MongoDB</strong> and <strong>Socket.IO</strong>, powering a mobile app that connects animal shelters and owners with adopters through swipe-based discovery and direct chat.
</p>

---

# 📂 Source Code

Backend repository:

https://github.com/violetaatkinson/Proyect---Beautiful---Souls

Frontend repository:

https://github.com/violetaatkinson/beautiful-sols-react

Live API base:

`https://<your-deployment>.vercel.app/api`

---

# ✨ Main Features

## 🔐 Authentication

* JWT-based login, password hashing with bcrypt.
* Route protection middleware (`isAuthenticated`) that attaches `req.currentUser`.
* The same JWT secret authenticates both REST requests and the Socket.IO handshake.

## 🐕 Pets

* Full CRUD for pet listings, scoped to their owner.
* Up to 4 photos per pet, stored on Cloudinary via multer.
* Swipe deck query excludes your own pets and anything you've already liked/disliked.
* Optional distance sorting via a 2dsphere geo index + Haversine distance calculation.

## ❤️ Likes & Dislikes

* Swipe history stored as join documents between `User` and `Pet`.
* Powers both the swipe deck exclusion logic and the "pets you liked" list.

## 💬 Real-time chat

* Messages scoped to a **(user, pet)** pair, not just a pair of users — the same two people can have separate threads about different pets.
* Socket.IO pushes new messages instantly to both participants, plus a live typing indicator.

## 🔔 Notifications

* Triggered on likes, new messages, and successful pet publication.
* Clear-all endpoint.

## 🎞️ Adoption stories

* Public wall of community-submitted pet stories.

---

# 🛠️ Technologies Used

### Core

* Node.js
* Express 4
* MongoDB + Mongoose 6

### Real-time

* Socket.IO

### Auth & Security

* jsonwebtoken
* bcrypt

### Media

* Cloudinary
* multer + multer-storage-cloudinary

### Other

* morgan (request logging)
* http-errors
* moment

---

# 📂 Project Structure

```text
proyect-beautiful-souls-back/
│
├── app.js                   Express app + HTTP server + Socket.IO wiring
│
├── config/
│   ├── routes.config.js     All API routes
│   ├── db.config.js         MongoDB connection
│   ├── cloudinary.config.js Image upload storage (multer + Cloudinary)
│   └── socket.config.js     Socket.IO: JWT handshake auth, per-user rooms, typing events
│
├── controllers/              Route handlers, one file per resource
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── pet.controller.js
│   ├── message.controller.js
│   ├── notification.controller.js
│   ├── adopted.controller.js
│   └── misc.controller.js    Like / Dislike
│
├── middlewares/
│   └── auth.middleware.js    JWT verification
│
├── models/                   Mongoose schemas
│   ├── User.model.js
│   ├── Pet.model.js
│   ├── Like.model.js
│   ├── Dislike.model.js
│   ├── Message.model.js
│   ├── Notification.model.js
│   └── Adopted.model.js
│
├── services/
│   └── notificationService.js
│
├── utils/
│   └── geo.js                 Haversine distance calculation
│
├── scripts/
│   └── migrate-adoptions-to-pets.js
│
└── constants/
    └── defaults.js             Default avatar, shared JWT secret
```

---

# 📱 Installation & Testing

## Try it live

The live API backs the deployed frontend:

https://beautifulsouls.vercel.app/login

## Prerequisites

* Node.js 16+
* A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
* A [Cloudinary](https://cloudinary.com/) account (free tier is enough) for image uploads

---

# 🧪 Development Testing

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/beautifulSouls
JWT_SECRET=replace-with-a-long-random-string
CLOUDINARY_NAME=your-cloudinary-cloud-name
CLOUDINARY_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret
```

> `JWT_SECRET` falls back to a hardcoded value if unset — **always set it explicitly in production**, since it signs and verifies both REST tokens and the Socket.IO handshake.

Run the server:

```bash
npm run dev     # nodemon, auto-restarts on change
npm start       # plain node
```

The API listens on `http://localhost:3001` (or `PORT`), mounted under `/api`.

One-off migration script:

```bash
npm run migrate:pets   # migrates legacy Adoption records into the Pet collection
```

---

# 📡 API Routes

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
| GET | `/adoptions` | 🔒 Swipe deck; `?lat=&lng=` for distance sorting |
| POST | `/adoptions/create` | 🔒 Create a pet listing (multipart, up to 4 `images`) |
| GET | `/adoptions/:id` | Pet detail |
| POST | `/adoptions/:id` | 🔒 Edit a pet you own |
| DELETE | `/adoptions/:id` | 🔒 Delete a pet you own |
| GET | `/myadoptions` | 🔒 Pets you've published |
| GET | `/adopted` | Community "Pet Stories" wall |
| POST | `/adopted/create` | 🔒 Share a pet story (multipart, optional `image`) |
| GET | `/like` | 🔒 List of pets you've liked |
| POST | `/like/:id` | 🔒 Toggle like on a pet |
| POST | `/dislike/:id` | 🔒 Pass on a pet |
| GET | `/notifications` | 🔒 Your notifications |
| DELETE | `/notifications` | 🔒 Clear all your notifications |
| GET | `/chat/list` | 🔒 Your conversations, one per (other user, pet) |
| GET | `/chat/:userId/:petId` | 🔒 Message history for a specific conversation |
| POST | `/chat/create` | 🔒 Send a message (`{ receiver, pet, msg }`) |

---

# 🚀 Future Improvements

* Rate limiting on auth and messaging endpoints.
* Read receipts for messages.
* Push notifications (web push).
* Admin endpoint to verify shelter accounts.
* Pagination cursors instead of page/limit on the swipe deck.
* Automated tests for controllers and sockets.

---

# 🎯 Project Goal

This API was built to support a full-stack, mobile-first adoption app end to end: authentication, image uploads, geolocation-aware queries, a like/dislike-driven discovery feed, and real-time messaging scoped intelligently per conversation — so a user talking about two different pets with the same person never gets those threads mixed up.

---

# 👩‍💻 Author

**Violeta Atkinson**
