import express from "express"; // Import Express framework
import { login, logout, register } from "../controllers/auth.controller.js"; // Import authentication controller functions

const router = express.Router(); // Create an instance of the Express router

// Route for user registration
router.post("/register", register); 

// Route for user login
router.post("/login", login); 

// Route for user logout
router.post("/logout", logout); 

export default router; 
