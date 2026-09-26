import { Link } from "react-router-dom";

function AuthNavbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Wazen
      </Link>
    </nav>
  );
}

export default AuthNavbar;