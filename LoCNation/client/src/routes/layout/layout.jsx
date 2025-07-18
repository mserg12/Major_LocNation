import "./layout.scss"; // Import SCSS file for styling
import Navbar from "../../components/navbar/Navbar"; // Import Navbar component
import { Outlet } from "react-router-dom"; // Import Outlet for rendering nested routes

function Layout() {
  return (
    <div className="layout">
      {/* Navbar Section */}
      <div className="navbar">
        <Navbar />
      </div>

      {/* Main Content Section - Outlet will render nested routes */}
      <div className="content">
        <Outlet /> 
      </div>
    </div>
  );
}

export default Layout;
