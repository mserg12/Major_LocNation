import prisma from "../lib/prisma.js";

// Function to add a new message to a chat
export const addMessage = async (req, res) => {
  const tokenUserId = req.userId; // The user who is sending the message
  const chatId = req.params.chatId; // ID of the chat where the message is sent
  const text = req.body.text; // The actual message content

  // Error handling: Check if required values are missing
  if (!text || !chatId) {
    console.error("Error: Message text or chat ID is missing!", { text, chatId });
    return res.status(400).json({ message: "Error: Message text or chat ID is missing!" });
  }

  try {
    // Check if the chat exists in the database
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      console.error("Error: Chat not found!", { chatId });
      return res.status(404).json({ message: "Error: Chat not found!" });
    }

    // Check if the user is a participant in the chat
    if (!chat.userIDs.includes(tokenUserId)) {
      console.error("Error: User is not part of the chat!", { tokenUserId, chatId });
      return res.status(403).json({ message: "Error: Access denied!" });
    }

    // Save the new message to the database
    const message = await prisma.message.create({
      data: {
        text, // Message content
        chatId, // Reference to the chat
        userId: tokenUserId, // ID of the user sending the message
        createdAt: new Date(), // Timestamp of when the message was created
      },
    });

    // Update the chat to store the latest message
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastMessage: text }, // Save the last sent message
    });

    console.log("Message successfully saved:", message);
    res.status(200).json(message); // Respond with the newly created message
  } catch (err) {
    console.error("Error while saving the message:", err);
    res.status(500).json({ message: "Error while saving the message!", error: err.message });
  }
};
