import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// Register a new user
export const register = async (req, res) => {
  const { username, email, password } = req.body; // Extract user details from request body

  try {
    // Hash the password for security before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword); // Log the hashed password (for debugging purposes)

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword, // Store hashed password instead of plain text
      },
    });

    console.log(newUser); // Log the newly created user (for debugging)

    // Respond with success message
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err); // Log any errors
    res.status(500).json({ message: "Failed to create user, he is already registered!" });
  }
};

// Login an existing user
export const login = async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  try {
    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

    // Validate the provided password against the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect password!" });

    // Generate a JWT token to authenticate the user
    const age = 1000 * 60 * 60 * 24 * 7; // Token expiration time: 7 days

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false, // Default user is not an admin
      },
      process.env.JWT_SECRET_KEY, // Secret key stored in environment variables
      { expiresIn: age } // Token expiration setting
    );

    // Exclude password from the user data before sending the response
    const { password: userPassword, ...userInfo } = user;

    // Send the token as an HTTP-only cookie for security
    res
      .cookie("token", token, {
        httpOnly: true, // Prevents client-side JavaScript access
        // secure: true, // Uncomment this line if using HTTPS
        maxAge: age, // Set cookie expiration time
      })
      .status(200)
      .json(userInfo); // Respond with user info (excluding password)
  } catch (err) {
    console.log(err); // Log any errors
    res.status(500).json({ message: "Failed to login!" });
  }
};

// Logout a user by clearing the authentication cookie
export const logout = (req, res) => {
  res.clearCookie("token") // Remove the authentication token
    .status(200)
    .json({ message: "Logout Successful" });
};
