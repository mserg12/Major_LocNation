import express from "express"; // Import Express framework
import cors from "cors"; // Import CORS middleware to handle cross-origin requests
import cookieParser from "cookie-parser"; // Import cookie-parser to handle cookies
import authRoute from "./routes/auth.route.js"; 
import postRoute from "./routes/post.route.js"; 
import testRoute from "./routes/test.route.js"; 
import userRoute from "./routes/user.route.js"; 
import chatRoute from "./routes/chat.route.js"; 
import messageRoute from "./routes/message.route.js"; 

const app = express(); // Initialize Express application

// Middleware to parse incoming JSON requests
app.use(express.json());

// Configure CORS to allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this frontend URL
    credentials: true, // Allow sending cookies with requests
  })
);

app.use(cookieParser());

// Define API routes
app.use("/api/auth", authRoute); // Authentication-related routes
app.use("/api/posts", postRoute); // Routes for posts
app.use("/api/test", testRoute); // Test route
app.use("/api/users", userRoute); // Routes for user management
app.use("/api/chats", chatRoute); // Routes for chat functionality
app.use("/api/messages", messageRoute); // Routes for handling messages

// Test route to check if the API is working
app.get("/api/test", (req, res) => {
  res.send("API is working fine!"); // Simple response to verify API is running
});

const PORT = 3301;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
