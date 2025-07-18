import { useContext, useState } from "react";
import "./navbar.scss";
import { Link } from "react-router-dom"; // Import Link for navigation
import { AuthContext } from "../../context/AuthContext"; // Import authentication context

function Navbar() {
  const [open, setOpen] = useState(false); // State to manage mobile menu visibility
  const { currentUser } = useContext(AuthContext); // Get current logged-in user from context

  return (
    <nav>
      {/* Left Section - Logo */}
      <div className="left">
        <a href="/" className="logo">
          <img src="/logo.png" alt="LoCNation Logo" />
          <span>LoCNation</span>
        </a>
      </div>

      {/* Right Section - Navigation & User Profile */}
      <div className="right">
        {/* If user is logged in, display their profile info */}
        {currentUser ? (
          <div className="user">
            <img src={currentUser.avatar || "/Noavatar.jpg"} alt="User Avatar" />
            <span>{currentUser.username}</span>
            <Link to="/profile" className="profile">
              <span>Profile</span>
            </Link>
          </div>
        ) : (
          // If user is NOT logged in, show Sign In and Sign Up links
          <>
            <a href="/login">Sign in</a>
            <a href="/register" className="register">Sign up</a>
          </>
        )}

        {/* Mobile Menu Icon */}
        <div className="menuIcon">
          <img src="/menu.png" alt="Menu Icon" onClick={() => setOpen((prev) => !prev)} />
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={open ? "menu active" : "menu"}>
          <a href="/login">Sign in</a>
          <a href="/register">Sign up</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
