import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate, useLocation } from "react-router-dom";
import { Suspense, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  useEffect(() => {
    const openChatId = location.state?.openChatId;
    if (openChatId && data.chatResponse?.data) {
      const chatToOpen = data.chatResponse.data.find((chat) => chat.id === openChatId);
      if (chatToOpen) {
        // Hier wird der Chat durch die initialChatId-Prop in der Chat-Komponente geöffnet
      }
    }
  }, [location.state, data.chatResponse]);

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser?.avatar || "/client/public/Noavatar.jpg"} alt="User Avatar" />
            </span>
            <span>
              Username: <b>{currentUser?.username}</b>
            </span>
            <span>
              Email: <b>{currentUser?.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My Listings</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading your listings...</p>}>
            <Await resolve={data.postResponse} errorElement={<p>Error loading posts!</p>}>
              {(postResponse) =>
                postResponse?.data?.userPosts?.length > 0 ? (
                  <List posts={postResponse.data.userPosts} />
                ) : (
                  <p>You haven't created any listings yet.</p>
                )
              }
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved Listings</h1>
          </div>
          <Suspense fallback={<p>Loading saved listings...</p>}>
            <Await resolve={data.postResponse} errorElement={<p>Error loading saved posts!</p>}>
              {(postResponse) =>
                postResponse?.data?.savedPosts?.length > 0 ? (
                  <List posts={postResponse.data.savedPosts} />
                ) : (
                  <p>You haven't saved any listings yet.</p>
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading chats...</p>}>
            <Await resolve={data.chatResponse} errorElement={<p>Error loading chats!</p>}>
              {(chatResponse) =>
                chatResponse?.data?.length > 0 ? (
                  <Chat chats={chatResponse.data} initialChatId={location.state?.openChatId} />
                ) : (
                  <p>You have no active chats.</p>
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;