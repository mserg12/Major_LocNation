import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

// Retrieve all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch all users from the database
    res.status(200).json(users); // Return the list of users
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" }); // Handle errors
  }
};

// Retrieve a single user by ID
export const getUser = async (req, res) => {
  const id = req.params.id; // Extract user ID from request parameters
  try {
    const user = await prisma.user.findUnique({
      where: { id }, // Fetch user by ID
    });
    res.status(200).json(user); // Return user data
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" }); // Handle errors
  }
};

// Update user details
export const updateUser = async (req, res) => {
  const id = req.params.id; // Extract user ID from request parameters
  const tokenUserId = req.userId; // Get authenticated user ID from the token
  const { password, avatar, ...inputs } = req.body; // Extract request body fields

  // Check if the authenticated user is allowed to update this profile
  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    // If a new password is provided, hash it before storing it
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    // Update user details in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs, // Update general user information
        ...(updatedPassword && { password: updatedPassword }), // Update password if provided
        ...(avatar && { avatar }), // Update avatar if provided
      },
    });

    const { password: userPassword, ...rest } = updatedUser; // Exclude password from response

    res.status(200).json(rest); // Return updated user data
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" }); // Handle errors
  }
};

// Delete a user account
export const deleteUser = async (req, res) => {
  const id = req.params.id; // Extract user ID from request parameters
  const tokenUserId = req.userId; // Get authenticated user ID from the token

  // Check if the authenticated user is allowed to delete this account
  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id }, // Delete user from the database
    });
    res.status(200).json({ message: "User deleted" }); // Return success response
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" }); // Handle errors
  }
};

// Toggle saving or unsaving a post
export const savePost = async (req, res) => {
  const postId = req.body.postId; // Get post ID from request body
  const tokenUserId = req.userId; // Get authenticated user ID from the token

  try {
    // Check if the post is already saved by the user
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      // If already saved, remove it
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      // If not saved, add it
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save post!" }); // Handle errors
  }
};

// Retrieve user posts and saved posts
export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId; // Get authenticated user ID from the token
  try {
    // Fetch posts created by the user
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });

    // Fetch posts saved by the user
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true, // Include post details
      },
    });

    // Extract only the post objects from saved posts
    const savedPosts = saved.map((item) => item.post);

    res.status(200).json({ userPosts, savedPosts }); // Return user posts and saved posts
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" }); // Handle errors
  }
};

// Retrieve the number of unread notifications for the user
export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId; // Get authenticated user ID from the token
  try {
    // Count the number of chats where the user has unread messages
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId], // Check if the user is a participant in the chat
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId], // Exclude chats that have already been seen by the user
          },
        },
      },
    });
    res.status(200).json(number); // Return the count of unread messages
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get notification count!" }); // Handle errors
  }
};
