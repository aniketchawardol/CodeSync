# CodeSathi

<div align="center">

![CodeSathi Logo](pfronend/public/icon.png)

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Latest-010101?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <strong>Real-time collaborative code editing platform for seamless developer collaboration</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-endpoints">API</a> •
  <a href="#contributing">Contributing</a>
</p>

</div>

---

## ✨ Features

<div align="center">
<table>
<tr>
<td>

- 🔄 Real-time collaborative code editing
- 👥 Live cursor tracking for multiple users
- 📁 File system synchronization
- 💬 Integrated chat system
- 🔐 User authentication
- 🗄️ MongoDB database integration
- ⚡ WebSocket-based real-time updates

</td>
</tr>
</table>
</div>

## 🛠️ Tech Stack

<div align="center">
<table>
<tr>
<th>Frontend</th>
<th>Backend</th>
</tr>
<tr>
<td>

- ⚛️ React 18
- ⚡ Vite
- 📝 Monaco Editor
- 🔌 Socket.IO Client
- 🎨 TailwindCSS
- 🔒 Auth0
- 🛣️ React Router

</td>
<td>

- 🟢 Node.js with Express
- 🔌 Socket.IO
- 🍃 MongoDB with Mongoose
- 🔄 RESTful API endpoints

</td>
</tr>
</table>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- MongoDB database
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/codesync.git
   cd codesync
   ```

2. Install dependencies
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables
   ```bash
   # Frontend .env
   VITE_API_URL=http://localhost:3000
   VITE_AUTH0_DOMAIN=your-auth0-domain
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id

   # Backend .env
   MONGO_URI=your-mongodb-connection-string
   ```

4. Run development servers
   ```bash
   # Start frontend (in frontend directory)
   npm run dev

   # Start backend (in backend directory)
   node index.js
   ```

## 🔄 API Endpoints

<div align="center">
<table>
<tr>
<th>Endpoint</th>
<th>Description</th>
</tr>
<tr><td>`POST /api/room`</td><td>Create a new room</td></tr>
<tr><td>`GET /api/room/:roomId`</td><td>Join an existing room</td></tr>
<tr><td>`POST /api/user`</td><td>Create or update user</td></tr>
<tr><td>`GET /api/user/:email`</td><td>Get user data</td></tr>
<tr><td>`GET /api/room/user/:email`</td><td>Get rooms created by user</td></tr>
</table>
</div>

## 🔌 WebSocket Events

<div align="center">
<table>
<tr>
<th>Event</th>
<th>Description</th>
</tr>
<tr><td>`join-room`</td><td>Join a collaboration room</td></tr>
<tr><td>`update-folder`</td><td>Sync folder structure changes</td></tr>
<tr><td>`cursor-update`</td><td>Track user cursor positions</td></tr>
<tr><td>`chat-send`</td><td>Send chat messages</td></tr>
<tr><td>`userJoined`</td><td>Handle new user connections</td></tr>
</table>
</div>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">

Made with ❤️ by the CodeSathi Team

</div>
