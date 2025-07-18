import express from "express"; // Import Express framework
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  savePost,
  profilePosts,
  getNotificationNumber
} from "../controllers/user.controller.js"; // Import user controller functions
import { verifyToken } from "../middleware/verifyToken.js"; // Import authentication middleware

const router = express.Router(); // Create an instance of the Express router

// Route to get all users (Public access)
router.get("/", getUsers); 
// Calls getUsers when a GET request is made to "/" (No authentication required)

// Route to get a specific user by ID
router.get("/search/:id", verifyToken, getUser); 
// Calls getUser when a GET request is made to "/search/:id" (Requires authentication)

// Route to update user details
router.put("/:id", verifyToken, updateUser); 

// Route to delete a user
router.delete("/:id", verifyToken, deleteUser); 

// Route to save or unsave a post
router.post("/save", verifyToken, savePost); 

router.get("/profilePosts", verifyToken, profilePosts); 

router.get("/notification", verifyToken, getNotificationNumber); 

export default router; // Export the router so it can be used in other parts of the application
