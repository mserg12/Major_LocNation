import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./card.scss";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";

function Card({ item }) {
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [saved, setSaved] = useState(item.isSaved || false);
  const [chatActive, setChatActive] = useState(false); 

  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem(`comments-${item.id}`)) || [];
    setComments(storedComments);
  }, [item.id]);

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      const newCommentObj = {
        text: newComment,
        username: currentUser.username || "Anonymous",
        avatar: currentUser.avatar || "/default-avatar.png",
      };

      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(`comments-${item.id}`, JSON.stringify(updatedComments));
      setNewComment("");
    }
  };

  const handleSavePost = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setSaved((prev) => !prev);
      await apiRequest.post("/users/save", { postId: item.id });
    } catch (err) {
      console.error("Error saving post:", err);
      setSaved((prev) => !prev);
      alert("Failed to save post. Please try again.");
    }
  };

  const handleSendMessage = async (isContactOwner = false) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!item.user || !item.user.id) {
      console.error("User ID is missing:", item.user);
      alert("Cannot start chat: User information is missing.");
      return;
    }

    try {
      setChatActive(true);
      
      // Get all chats
      const resChats = await apiRequest.get("/chats");
      const existingChats = resChats.data;
      
      // Find existing chat with this user
      const existingChat = existingChats.find(
        (chat) => chat.userIDs.includes(item.user.id) && 
                 chat.userIDs.includes(currentUser.id) &&
                 chat.userIDs.length === 2
      );

      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new chat with the post owner
        const resNewChat = await apiRequest.post("/chats", {
          receiverId: item.user.id,
        });
        chatId = resNewChat.data.id;
      }

      // If this is a contact owner action, send a default message
      if (isContactOwner) {
        try {
          const messageText = `Hello! I'm interested in your property "${item.title}"`;
          const res = await apiRequest.post(`/messages/${chatId}`, {
            text: messageText,
          });

          // Update the chat's last message
          const updatedChats = existingChats.map(chat => 
            chat.id === chatId ? { ...chat, lastMessage: messageText } : chat
          );
          
          // If this is a new chat, add it to the list
          if (!existingChat) {
            updatedChats.push({
              id: chatId,
              userIDs: [currentUser.id, item.user.id],
              receiver: item.user,
              lastMessage: messageText,
              updatedAt: new Date().toISOString()
            });
          }
          
          // Notify via socket if available
          if (socket) {
            socket.emit("sendMessage", {
              receiverId: item.user.id,
              data: {
                ...res.data,
                chatId,
                senderId: currentUser.id,
                text: messageText,
                createdAt: new Date().toISOString()
              }
            });
          }
        } catch (err) {
          console.error("Failed to send initial message:", err);
          // Continue to chat even if message sending fails
        }
      }

      // Navigate to profile with the chat open
      navigate("/profile", { 
        state: { 
          openChatId: chatId,
          // Pass the chat data to avoid an extra API call
          chatData: {
            id: chatId,
            userIDs: [currentUser.id, item.user.id],
            receiver: item.user,
            lastMessage: isContactOwner ? `Hello! I'm interested in your property "${item.title}"` : '',
            updatedAt: new Date().toISOString()
          }
        } 
      });
      
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      alert("Failed to start chat. Please try again later.");
    } finally {
      setChatActive(false);
    }
  };

  return (
    <div className="card">
      <div className="cardMain">
        <Link to={`/${item.id}`} className="imageContainer">
          <img src={item.images[0]} alt={item.title} />
        </Link>
        <div className="textContainer">
          <h2 className="title">
            <Link to={`/${item.id}`}>{item.title}</Link>
          </h2>
          <p className="address">
            <img src="/pin.png" alt="Location Pin" />
            <span>{item.address}</span>
          </p>
          <p className="price">$ {item.price}</p>
          
          {/* Property Details */}
          <div className="property-details">
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{item.type || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Property:</span>
              <span className="detail-value">{item.property || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">
                {item.locationType ? item.locationType.charAt(0).toUpperCase() + item.locationType.slice(1) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bottom">
            <div className="features">
              <div className="feature">
                <img src="/bed.png" alt="Bed Icon" />
                <span>{item.bedroom || 0} bedroom{item.bedroom !== 1 ? 's' : ''}</span>
              </div>
              <div className="feature">
                <img src="/bath.png" alt="Bath Icon" />
                <span>{item.bathroom || 0} bathroom{item.bathroom !== 1 ? 's' : ''}</span>
              </div>
              {item.postDetail?.size && (
                <div className="feature">
                  <img src="/size.png" alt="Size Icon" />
                  <span>{item.postDetail.size} sqm</span>
                </div>
              )}
            </div>
            <div className="icons">
              <div
                className={`icon ${saved ? "active" : ""}`}
                onClick={handleSavePost}
                style={{ cursor: "pointer" }}
              >
                <img src="/save.png" alt="Save Icon" />
              </div>
              <div
                className={`icon ${chatActive ? "active" : ""}`}
                onClick={handleSendMessage}
                style={{ cursor: "pointer" }}
              >
                <img src="/chat.png" alt="Chat Icon" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Details Sidebar */}
        <div className="propertySidebar">
          <div className="priceSection">
            <span className="price">${item.price}</span>
            <span className="priceLabel">/month</span>
          </div>
          
          <div className="propertyMeta">
            {/* Type */}
            <div className="metaItem">
              <div className="metaIcon">
                <img src="/type.png" alt="Type" />
              </div>
              <div className="metaContent">
                <span className="metaLabel">Type</span>
                <span className="metaValue">{item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'N/A'}</span>
              </div>
            </div>
            
            {/* Genre */}
            {item.genre && (
              <div className="metaItem">
                <div className="metaIcon">
                  <img src="/movie.png" alt="Genre" />
                </div>
                <div className="metaContent">
                  <span className="metaLabel">Genre</span>
                  <span className="metaValue">{item.genre}</span>
                </div>
              </div>
            )}
            
            {/* Property */}
            <div className="metaItem">
              <div className="metaIcon">
                <img src="/home.png" alt="Property" />
              </div>
              <div className="metaContent">
                <span className="metaLabel">Property</span>
                <span className="metaValue">{item.property ? item.property.charAt(0).toUpperCase() + item.property.slice(1) : 'N/A'}</span>
              </div>
            </div>
            
            {/* Location Type */}
            <div className="metaItem">
              <div className="metaIcon">
                <img src={
                  item.locationType === 'indoor' ? "/indoor.png" : 
                  item.locationType === 'outdoor' ? "/outdoor.png" : 
                  "/location-pin.png"
                } alt="Location Type" />
              </div>
              <div className="metaContent">
                <span className="metaLabel">Location Type</span>
                <span className="metaValue">
                  {item.locationType ? item.locationType.charAt(0).toUpperCase() + item.locationType.slice(1) : 'N/A'}
                </span>
              </div>
            </div>
          
            {item.postDetail?.size && (
              <div className="metaItem">
                <div className="metaIcon">
                  <img src="/ruler.png" alt="Size" />
                </div>
                <div className="metaContent">
                  <span className="metaLabel">Size</span>
                  <span className="metaValue">{item.postDetail.size} m²</span>
                </div>
              </div>
            )}
            
            {(item.bedroom || item.bedroom === 0) && (
              <div className="metaItem">
                <div className="metaIcon">
                  <img src="/bed.png" alt="Bedrooms" />
                </div>
                <div className="metaContent">
                  <span className="metaLabel">Bedrooms</span>
                  <span className="metaValue">{item.bedroom} {item.bedroom === 1 ? 'bedroom' : 'bedrooms'}</span>
                </div>
              </div>
            )}
            
            {(item.bathroom || item.bathroom === 0) && (
              <div className="metaItem">
                <div className="metaIcon">
                  <img src="/bath.png" alt="Bathrooms" />
                </div>
                <div className="metaContent">
                  <span className="metaLabel">Bathrooms</span>
                  <span className="metaValue">{item.bathroom} {item.bathroom === 1 ? 'bathroom' : 'bathrooms'}</span>
                </div>
              </div>
            )}
            
            {item.postDetail?.minCrewSize && (
              <div className="metaItem">
                <div className="metaIcon">
                  <img src="/users.png" alt="Crew Size" />
                </div>
                <div className="metaContent">
                  <span className="metaLabel">Min. Crew</span>
                  <span className="metaValue">{item.postDetail.minCrewSize} people</span>
                </div>
              </div>
            )}
            
            {/* Amenities Section */}
            {(item.postDetail?.hasFilmingPermit || item.postDetail?.hasStudio || 
              item.postDetail?.hasPower || item.postDetail?.availableParking) && (
              <div className="amenitiesSection">
                <h4>Amenities & Features</h4>
                <div className="amenitiesList">
                  {item.postDetail?.hasFilmingPermit && <span>Filming Permit</span>}
                  {item.postDetail?.hasStudio && <span>Studio</span>}
                  {item.postDetail?.hasPower && <span>Power Supply</span>}
                  {item.postDetail?.availableParking && <span>Parking Available</span>}
                </div>
              </div>
            )}
            
            <button 
              className={`contactButton ${chatActive ? 'active' : ''}`} 
              onClick={() => handleSendMessage(true)}
              disabled={chatActive}
            >
              <img src="/message.png" alt="Message" />
              {chatActive ? 'Opening Chat...' : 'Contact Owner'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="commentSection">
        <div className="commentInput">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
        
        <div className="commentsList">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="comment">
                <img 
                  src={comment.avatar} 
                  alt={comment.username} 
                  className="commentAvatar" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div className="commentText">
                  <strong>{comment.username}</strong>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;