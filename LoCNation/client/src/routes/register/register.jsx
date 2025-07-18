import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";

function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password").trim();
    const passwordConfirm = formData.get("passwordConfirm").trim();

    if (!username || !email || !password || !passwordConfirm) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest.post("/auth/register", { username, email, password });

      setSuccess("You have successfully registered! Redirecting to login...");
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>

          <input name="username" type="text" placeholder="Username" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <input 
            name="passwordConfirm" 
            type="password" 
            placeholder="Confirm Password" 
            required 
          />

          <button disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>

          {error && <span className="errorMessage">{error}</span>}
          {success && <span className="successMessage">{success}</span>}

          <Link to="/login">Already have an account? Log in</Link>
        </form>
      </div>

      <div className="imgContainer">
        {/* <img src="/bg.png" alt="Background" /> */}
      </div>
    </div>
  );
}

export default Register;