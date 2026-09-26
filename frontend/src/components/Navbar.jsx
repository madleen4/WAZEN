import { Link, useNavigate } from "react-router-dom";

function Navbar({ CurrentPage }) {

  //  redirect after logout
  const navigate = useNavigate();

  // Logout function
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  if (CurrentPage === "home") {
    return (
      <nav className="navbar">
        <Link to="/" className="logo">Wazen</Link>

        <ul className="nav-links">
          <li>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Wazen</Link>

      <ul className="nav-links">
        <li><Link to="/dashboard" className={CurrentPage === "dashboard" ? "active" : ""}>Dashboard</Link></li>
        <li><Link to="/courses" className={CurrentPage === "courses" ? "active" : ""}>Courses</Link></li>
        <li><Link to="/deadlines" className={CurrentPage === "deadlines" ? "active" : ""}>Deadlines</Link></li>
        <li><Link to="/availability" className={CurrentPage === "availability" ? "active" : ""}>Availability</Link></li>
        <li><Link to="/studyplan" className={CurrentPage === "studyplan" ? "active" : ""}>Study Plan</Link></li>
        <li><Link to="/progress" className={CurrentPage === "progress" ? "active" : ""}>Progress</Link></li>
        <li><Link to="/statistics" className={CurrentPage === "statistics" ? "active" : ""}>Statistics</Link></li>
        <li><Link to="/notifications" className={CurrentPage === "notifications" ? "active" : ""}>Notifications</Link></li>

        <li>
          <button className="btn btn-sm" type="button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;