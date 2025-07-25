# Major_Projekt
# Major_Projekt
# 🎬 Major_LocNation

A full-stack MERN application that helps filmmakers discover and share filming locations, with real-time chat, interactive maps, and advanced filtering features.

---

## 📁 Project Structure

LoCNation/
├── client/ # React frontend (Vite)
├── api/ # Node.js + Express backend
├── socket/ # Real-time Socket.IO server
├── README.md # This file
├── .gitignore



---

## ⚙️ Technologies Used

| Layer     | Stack                        |
|-----------|------------------------------|
| Frontend  | React.js (Vite)              |
| Backend   | Node.js, Express             |
| Realtime  | Socket.IO                    |
| Database  | MongoDB Atlas + Prisma ORM   |
| Styling   | SCSS                         |
| Auth      | JWT                          |

---

## 🛠️ Prerequisites

Please ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- Internet connection (MongoDB Atlas used)

---

## 📥 1. Clone the Repository

```bash
git clone https://github.com/mserg12/Major_LocNation.git
cd Major_LocNation/LoCNation
📦 2. Install Dependencies
Install packages for each module:

bash
Copy
Edit
# Frontend
cd client
npm install

# Backend
cd ../api
npm install

# Socket.IO Server
cd ../socket
npm install
⚙️ 3. Set Environment Variables
Create a file named .env inside the /api directory with the following content:

env
Copy
Edit
# /api/.env
DATABASE_URL="mongodb+srv://muhammedserag353:Muserag123@cluster0.poeg8.mongodb.net/estate?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET_KEY=u1RLhYjnjuNDxVLRXLuHG6amnbyw/VYc6hoqFwL8Mms=
CLIENT_URL=http://localhost:5173/
🔐 Note: This file is not tracked in version control for security reasons.

🚀 4. Start the Application
Open three terminals and run each part separately:

Terminal 1 – Frontend
bash
Copy
Edit
cd client
npm run dev
Runs on: http://localhost:5173

Terminal 2 – Backend API
bash
Copy
Edit
cd api
console-ninja node --watch app.js
API runs on: http://localhost:5000

Terminal 3 – Socket.IO Server
bash
Copy
Edit
cd socket
console-ninja node --watch app.js
Socket server uses the port configured in socket/app.js