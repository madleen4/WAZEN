import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationTable from "../components/NotificationTable";
import apiRequest from "../utils/api";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "Study Session",
    date: ""
  });

  async function loadNotifications() {
    try {
      const data = await apiRequest("/notifications");
      setNotifications(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function addNotification(event) {
    event.preventDefault();

    try {
      await apiRequest("/notifications", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setForm({
        title: "",
        message: "",
        type: "Study Session",
        date: ""
      });

      setMessage("Notification added successfully.");
      loadNotifications();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteNotification(id) {
    try {
      await apiRequest(`/notifications/${id}`, {
        method: "DELETE"
      });

      loadNotifications();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Navbar CurrentPage="notifications" />

      <main className="wrap">
        <div className="card">
          <h1>Notifications</h1>
          <p>Manage reminders for study sessions and deadlines.</p>

          {message && <p className="message">{message}</p>}

          <form onSubmit={addNotification}>
            <div className="row">
              <input
                className="inputDashboard"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Notification title"
              />

              <input
                className="inputDashboard"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Message"
              />

              <input
                className="inputDashboard"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />

              <select name="type" value={form.type} onChange={handleChange}>
                <option>Study Session</option>
                <option>Deadline</option>
                <option>General</option>
              </select>

              <button className="btn" type="submit">
                Add Notification
              </button>
            </div>
          </form>

          <NotificationTable
            notifications={notifications}
            deleteNotification={deleteNotification}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default NotificationsPage;