const API_URL = "http://localhost:3000";

async function apiRequest(path, options = {}) {

  //  Get JWT token from localStorage
  const token = localStorage.getItem("token");

  // Prepare headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  //  Send token to protected backend routes
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();

  //  If token is invalid or expired, logout.
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export default apiRequest;