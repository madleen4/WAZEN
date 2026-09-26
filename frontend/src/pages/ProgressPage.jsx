import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProgressSummary from "../components/ProgressSummary";
import apiRequest from "../utils/api";

function ProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    courseName: "",
    sessionTitle: "",
    status: "Planned",
    studyHours: "",
    studyDate: ""
  });

  async function loadProgress() {
    try {
      const data = await apiRequest("/progress");
      setProgressData(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function addProgress(event) {
    event.preventDefault();

    if (
      !form.courseName ||
      !form.sessionTitle ||
      !form.studyHours ||
      !form.studyDate
    ) {
      setMessage("Please fill in all study session fields.");
      return;
    }

    try {
      await apiRequest("/progress", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setForm({
        courseName: "",
        sessionTitle: "",
        status: "Planned",
        studyHours: "",
        studyDate: ""
      });

      setMessage("Study session added successfully.");
      loadProgress();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      await apiRequest(`/progress/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });

      if (status === "Completed") {
        setMessage("Session marked as completed. Your completion rate has been updated.");
      } else if (status === "Missed") {
        setMessage(
          "Session marked as missed. The system will adjust future sessions to help you stay on track."
        );
      }

      loadProgress();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteProgress(id) {
    try {
      await apiRequest(`/progress/${id}`, {
        method: "DELETE"
      });

      setMessage("Study session deleted successfully.");
      loadProgress();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Navbar CurrentPage="progress" />

      <main className="wrap">
        <div className="card">
          <h1>Progress</h1>
          <p>
            Track your planned, completed, and missed study sessions.
          </p>

          {message && <p className="message">{message}</p>}

          <form onSubmit={addProgress}>
            <div className="row">
              <input
                className="inputDashboard"
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="Course name"
              />

              <input
                className="inputDashboard"
                name="sessionTitle"
                value={form.sessionTitle}
                onChange={handleChange}
                placeholder="Session title"
              />

              <input
                className="inputDashboard"
                name="studyHours"
                type="number"
                min="1"
                value={form.studyHours}
                onChange={handleChange}
                placeholder="Study hours"
              />

              <input
                className="inputDashboard"
                name="studyDate"
                type="date"
                value={form.studyDate}
                onChange={handleChange}
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Planned</option>
                <option>Completed</option>
                <option>Missed</option>
              </select>

              <button className="btn" type="submit">
                Add Study Session
              </button>
            </div>
          </form>

          <ProgressSummary
            progressData={progressData}
            updateStatus={updateStatus}
            deleteProgress={deleteProgress}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProgressPage;