import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";

function Chat({ chats: initialChats, initialChatId, onChatDeleted }) {
  const [chat, setChat] = useState(null);
  const [chats, setChats] = useState(initialChats); 
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (initialChatId && chats) {
      const initialChat = chats.find((c) => c.id === initialChatId);
      if (initialChat) {
        handleOpenChat(initialChat.id, initialChat.receiver);
      }
    }
  }, [initialChatId, chats]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest.get(`/chats/${id}`);
      setChat({ ...res.data, receiver });

      if (!res.data.seenBy.includes(currentUser.id)) {
        await apiRequest.put(`/chats/read/${id}`);
      }
    } catch (err) {
      console.log("Error opening chat:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text || !chat) return;

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
      }));

      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });

      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === chat.id ? { ...c, lastMessage: text } : c
        )
      );

      e.target.reset();
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.log("⚠️ Error sending message:", err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await apiRequest.delete(`/chats/${chatId}`);
      setChats((prevChats) => prevChats.filter((c) => c.id !== chatId)); 
      if (chat && chat.id === chatId) {
        setChat(null); 
      }
      if (onChatDeleted) {
        onChatDeleted(chatId); 
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat. Please try again.");
    }
  };

  useEffect(() => {
    if (!socket || !chat) return;

    socket.on("getMessage", (data) => {
      if (chat.id === data.chatId) {
        setChat((prev) => ({
          ...prev,
          messages: [...prev.messages, data],
        }));
        
        setChats((prevChats) =>
          prevChats.map((c) =>
            c.id === data.chatId ? { ...c, lastMessage: data.text } : c
          )
        );
      }
    });

    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
          >
            <div className="messageContent" onClick={() => handleOpenChat(c.id, c.receiver)}>
              <span>{c.receiver.username}</span>
              <p>{c.lastMessage}</p>
            </div>
            <button
              className="deleteChat"
              onClick={(e) => {
                e.stopPropagation(); 
                handleDeleteChat(c.id);
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <span>{chat.receiver.username}</span>
            </div>
            <span className="close" onClick={() => setChat(null)}>X</span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className={`chatMessage ${message.userId === currentUser.id ? "own" : ""}`}
                key={message.id}
              >
                <div className={`messageBubble ${message.userId === currentUser.id ? "own" : ""}`}>
                  <p>{message.text}</p>
                  <span className="timestamp">{format(message.createdAt)}</span>
                </div>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSendMessage} className="bottom">
            <input type="text" name="text" placeholder="Type a message..." />
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;