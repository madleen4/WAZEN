import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthNavbar from "../components/AuthNavbar";
import apiRequest from "../utils/api";

function RegisterPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: ""
  });

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.firstName.trim() === "" || form.lastName.trim() === "") {
      setError("Name is required.");
      return;
    }

    if (form.email.trim() === "") {
      setError("Email is required.");
      return;
    }

    if (form.phone.trim() === "") {
      setError("Phone number is required.");
      return;
    }

    if (form.phone.trim().length !== 10 || isNaN(form.phone)) {
      setError("Phone number must be 10 digits long and contain only numbers.");
      return;
    }

    if (form.password.trim() === "") {
      setError("Password is required.");
      return;
    }

    if (form.confirmPassword.trim() === "") {
      setError("Confirm Password is required.");
      return;
    }

    if (form.gender.trim() === "") {
      setError("Gender is required.");
      return;
    }

    if (form.confirmPassword !== form.password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {

      // Store backend response because register returns token
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          gender: form.gender
        })
      });

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user data
      localStorage.setItem("user", JSON.stringify(data.user));

      //  Go directly to dashboard after registration
      navigate("/dashboard");

    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      <AuthNavbar />

      <main>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: "350px", marginTop: "30px" }}
        />

        <h1>New account?</h1>

        <form onSubmit={handleSubmit} id="registerForm" className="register-form">
          <div className="name-row">
            <div className="form-field">
              <label className="RegLog">First name</label>
              <input
                className="RegLog"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label className="RegLog">Last name</label>
              <input
                className="RegLog"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="RegLog">Email</label>
            <input
              className="RegLog"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label className="RegLog">Phone number</label>
            <input
              className="RegLog"
              name="phone"
              type="text"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label className="RegLog">Password</label>
            <input
              className="RegLog"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label className="RegLog">Confirm password</label>
            <input
              className="RegLog"
              name="confirmPassword"
              type="password"
              placeholder="Enter confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="gender-field">
            <label className="RegLog">Your gender</label>

            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={form.gender === "female"}
                  onChange={handleChange}
                />
                Female
              </label>

              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={form.gender === "male"}
                  onChange={handleChange}
                />
                Male
              </label>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="auth-btn" type="submit">
            Create an account
          </button>
        </form>

        <p className="RegLog" style={{ marginTop: "50px" }}>
          You have an account?
          <Link to="/login" className="toRegLog">
            Log In
          </Link>
        </p>
      </main>

      <Footer />
    </>
  );
}

export default RegisterPage;