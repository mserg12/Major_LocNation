import jwt from "jsonwebtoken";

// Check if the user is logged in
export const shouldBeLoggedIn = async (req, res) => {
  console.log(req.userId); // Log the user ID to verify authentication
  res.status(200).json({ message: "You are Authenticated" }); // Respond with success if authenticated
};

// Check if the user is an admin
export const shouldBeAdmin = async (req, res) => {
  const token = req.cookies.token; // Retrieve JWT token from cookies

  // If no token is found, return an authentication error
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" }); // If token is invalid, return error

    // Check if the user has admin privileges
    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Not authorized!" }); // Return error if user is not an admin
    }
  });

  res.status(200).json({ message: "You are Authenticated" }); // Respond with success if user is authenticated as an admin
};

