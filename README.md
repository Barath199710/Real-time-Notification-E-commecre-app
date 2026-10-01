# Task 19 – Real-Time Notifications E-Commerce App

A modern full-stack web application with **Flask-SocketIO**, **React**, and **Socket.IO Client** implementing real-time event-driven notifications across user sessions.

## 🚀 Features Included in Task 19

1. **WebSockets & Real-Time Event Communication:**
   - Persistent bidirectional WebSocket connection using `Flask-SocketIO` and `socket.io-client`.
   - Dynamic room assignment (`join_room('admins')` & `join_room('user_{id}')`).
   - Server-pushed `new_notification` events emitted live without polling or page refreshes.

2. **Database Persistence:**
   - `notifications` SQLite table (`id`, `user_id`, `message`, `type`, `is_read`, `created_at`).
   - Hybrid architecture: Notifications persist in DB and survive browser page refreshes via REST API (`GET /api/notifications`).

3. **Frontend Real-Time Notification Bell Component:**
   - Interactive `NotificationBell.jsx` component in Navbar.
   - Live red badge counter showing unread notifications.
   - Dropdown panel displaying relative time ("2 mins ago"), read/unread indicator, type icons (`order` 🛒, `alert` ⚠️, `info` ℹ️).
   - "Mark all as read" & individual delete functionality.

4. **Bonus Features:**
   - **Low Stock Warning Alert**: Automatically triggers an alert notification to admins when product stock drops to 5 or lower.
   - **Sound Ping Notification**: Plays a subtle audio ping when a new real-time notification arrives.
   - **Browser Push Notifications**: Optional OS native notification support via standard Web Notification API.

---

## 🛠️ How to Run

### 1. Start Backend (Flask + SocketIO API)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Backend server runs on `http://localhost:5000` with WebSocket support.*

### 2. Run Backend Unit Tests
```bash
cd backend
python test_task19_api.py
```

### 3. Start Frontend (React + Socket.IO)
```bash
cd frontend
npm install
npm run dev
```
*Frontend app runs on `http://localhost:5173`.*

---

## 📄 Submission Write-Up & Technical Answers
See [`TASK_19_WRITEUP.md`](./TASK_19_WRITEUP.md) for full answers to all submission questions.
