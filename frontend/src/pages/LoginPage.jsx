import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import apiRequest from "../utils/api";

function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      //  Save JWT token
      localStorage.setItem("token", data.token);

      //  Save user data using consistent key name
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful");

      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  }

  return (

    <>
      <AuthNavbar />

      <main>
        <img
          className="loginlogo"
          src="/images/logo.png"
          alt="Logo"
          style={{ width: "350px", marginTop: "30px" }}
        />

        <form onSubmit={handleLogin} className="register-form">
          <div className="form-field">
            <label className="RegLog">Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="RegLog">Password</label>
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-btn" type="submit">
            login
          </button>
        </form>

        <p className="RegLog">
          Don't have an account?
          <Link to="/register" className="toRegLog"> Register </Link>
        </p>
      </main>
    </>
  );

}

export default LoginPage;