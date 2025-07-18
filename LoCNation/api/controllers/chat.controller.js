import prisma from "../lib/prisma.js";

// Function to get all chats for the authenticated user
export const getChats = async (req, res) => {
  const tokenUserId = req.userId; // Extract the authenticated user's ID from the request

  try {
    // Retrieve all chats where the authenticated user is a participant
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId], // Check if the user is in the chat
        },
      },
    });

    // Loop through each chat to find the receiver (other participant)
    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      // Fetch receiver's details (ID, username, avatar)
      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      // Attach receiver details to the chat object
      chat.receiver = receiver;
    }

    // Respond with the list of chats
    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

// Function to get details of a specific chat
export const getChat = async (req, res) => {
  const tokenUserId = req.userId; // Extract the authenticated user's ID

  try {
    // Find the chat by its ID and ensure the user is a participant
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId], // Ensure the user is part of the chat
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc", // Order messages from oldest to newest
          },
        },
      },
    });

    // Mark chat as seen by the authenticated user
    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId], // Add user to the seenBy array
        },
      },
    });

    // Respond with the chat details
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

// Function to create a new chat between two users
export const addChat = async (req, res) => {
  const tokenUserId = req.userId; // Extract the authenticated user's ID

  try {
    // Create a new chat with both users as participants
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, req.body.receiverId], // Store both user IDs in chat
      },
    });

    // Respond with the created chat details
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

// Function to mark a chat as read
export const readChat = async (req, res) => {
  const tokenUserId = req.userId; // Extract the authenticated user's ID

  try {
    // Update the chat to include the authenticated user in the "seenBy" array
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId], // Ensure the user is part of the chat
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId], // Mark the chat as seen by the user
        },
      },
    });

    // Respond with the updated chat details
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};

// 🚀 New function to delete a chat
export const deleteChat = async (req, res) => {
  const tokenUserId = req.userId; // Extract the authenticated user's ID

  try {
    // Check if the chat exists
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" }); // Return error if chat does not exist
    }

    // Check if the authenticated user is a participant in the chat
    if (!chat.userIDs.includes(tokenUserId)) {
      return res.status(403).json({ message: "Unauthorized to delete this chat!" });
    }

    // Delete all messages related to the chat before deleting the chat itself
    await prisma.message.deleteMany({
      where: {
        chatId: req.params.id,
      },
    });

    // Delete the chat from the database
    await prisma.chat.delete({
      where: {
        id: req.params.id,
      },
    });

    // Respond with success message
    res.status(200).json({ message: "Chat deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete chat!" });
  }
};
