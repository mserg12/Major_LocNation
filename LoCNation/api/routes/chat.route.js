import express from "express"; // Import Express framework
import {
  getChats,
  getChat,
  addChat,
  readChat,
  deleteChat,
} from "../controllers/chat.controller.js"; // Import chat controller functions
import { verifyToken } from "../middleware/verifyToken.js"; // Import authentication middleware

const router = express.Router(); // Create an instance of the Express router

// Route to get all chats for the authenticated user
router.get("/", verifyToken, getChats); 

// Route to get a single chat by its ID
router.get("/:id", verifyToken, getChat); 

// Route to create a new chat
router.post("/", verifyToken, addChat); 

// Route to mark a chat as read
router.put("/read/:id", verifyToken, readChat); 

// Route to delete a chat (New DELETE route)
router.delete("/:id", verifyToken, deleteChat); 

export default router; // Export the router so it can be used in other parts of the application
