import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("Post data from useLoaderData:", post);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.error("Error saving post:", err);
      setSaved((prev) => !prev);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!post.user || !post.user.id) {
      console.error("User ID is missing:", post.user);
      alert("Cannot start chat: User information is missing.");
      return;
    }

    try {
      // Schritt 1: Hole alle Chats des aktuellen Benutzers
      const resChats = await apiRequest.get("/chats");
      const existingChats = resChats.data;

      // Schritt 2: Prüfe, ob ein Chat mit dem Post-Ersteller bereits existiert
      const existingChat = existingChats.find((chat) =>
        chat.userIDs.includes(post.user.id) && chat.userIDs.includes(currentUser.id)
      );

      if (existingChat) {
        // Wenn ein Chat existiert, navigiere direkt zur Profilseite mit der Chat-ID
        console.log("Existing chat found:", existingChat);
        navigate("/profile", { state: { openChatId: existingChat.id } });
      } else {
        // Wenn kein Chat existiert, erstelle einen neuen
        console.log("Creating new chat with receiverId:", post.user.id);
        const resNewChat = await apiRequest.post("/chats", {
          receiverId: post.user.id,
        });
        console.log("Chat creation response:", resNewChat.data);
        if (!resNewChat.data.id) {
          throw new Error("Chat ID not found in response");
        }
        navigate("/profile", { state: { openChatId: resNewChat.data.id } });
      }
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      if (err.response && err.response.status === 400) {
        alert("Invalid request. Please try again.");
      } else {
        alert("Failed to start chat. Please try again later.");
      }
      navigate("/profile");
    }
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images || []} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title || "No Title"}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address || "No Address"}</span>
                </div>
                <div className="price">$ {post.price || "N/A"}</div>
              </div>
              <div className="user">
                <img src={post.user?.avatar || "/default-avatar.png"} alt="" />
                <span>{post.user?.username || "Unknown User"}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail?.desc || ""),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail?.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail?.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <div className="featureText">
                <p>{post.postDetail?.income || "N/A"}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail?.size || "N/A"} qm</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom || "N/A"} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom || "N/A"} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail?.bus || "N/A"}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail?.restaurant || "N/A"}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handleSendMessage}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;