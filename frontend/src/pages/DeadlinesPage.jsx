import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiRequest from "../utils/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DaysBadge({ dateStr }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due  = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0)   return <span className="badge badge-past">Past</span>;
  if (diff === 0) return <span className="badge badge-today">Today</span>;
  if (diff <= 3)  return <span className="badge badge-soon">{diff}d left</span>;
  return <span className="badge badge-ok">{diff}d left</span>;
}

function DeadlinesPage() {
  const [deadlines,   setDeadlines]   = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [courseName,  setCourseName]  = useState("");
  const [title,       setTitle]       = useState("");
  const [type,        setType]        = useState("Exam");
  const [date,        setDate]        = useState("");
  const [time,        setTime]        = useState("");
  const [editId,      setEditId]      = useState(null);
  const [msg,         setMsg]         = useState({ text: "", type: "" });
  const [showModal,   setShowModal]   = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    loadDeadlines();
    loadCourses();
  }, []);

  async function loadDeadlines() {
    try {
      const data = await apiRequest("/deadlines");
      setDeadlines(data);
    } catch (err) {
      showMessage("Failed to load deadlines.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    try {
      const data = await apiRequest("/courses");
      setCourses(data);
    } catch (err) {
      // silently fail — courses dropdown won't populate
    }
  }

  function showMessage(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  }

  function clearForm() {
    setCourseName(""); setTitle(""); setType("Exam");
    setDate(""); setTime(""); setEditId(null);
  }

  async function handleSubmit() {
    if (!courseName) { showMessage("Please select a course.", "error"); return; }
    if (!title.trim()) { showMessage("Please enter a title.", "error"); return; }
    if (!date) { showMessage("Please select a due date.", "error"); return; }

    try {
      if (editId) {
        await apiRequest(`/deadlines/${editId}`, {
          method: "PUT",
          body: JSON.stringify({ courseName, title, type, date, time })
        });
        showMessage("Deadline updated successfully!", "success");
      } else {
        await apiRequest("/deadlines", {
          method: "POST",
          body: JSON.stringify({ courseName, title, type, date, time })
        });
        showMessage("Deadline added successfully!", "success");
      }
      await loadDeadlines();
      clearForm();
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  function startEdit(d) {
    setCourseName(d.courseName); setTitle(d.title);
    setType(d.type); setDate(d.date); setTime(d.time || "");
    setEditId(d._id);
  }

  function confirmDelete(id) {
    setDeleteId(id);
    setShowModal(true);
  }

  async function handleDelete() {
    try {
      await apiRequest(`/deadlines/${deleteId}`, { method: "DELETE" });
      await loadDeadlines();
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      showMessage("Failed to delete deadline.", "error");
    }
  }

  const sorted = [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <Navbar CurrentPage="deadlines" />

      <main className="wrap">
        <h1>Deadlines</h1>

        {/* Form Card */}
        <section>
          <div className="card">
            <h2>{editId ? "Edit Deadline" : "Add New Deadline"}</h2>

            <div>
              <label>Course Name</label>
             <input className="inputDashboard" type="text"
              placeholder="e.g., Web Development"
               value={courseName} onChange={e => setCourseName(e.target.value)} />
            </div>

            <div>
              <label>Title</label>
              <input className="inputDashboard" type="text"
                placeholder="e.g., Midterm"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option>Exam</option>
                <option>Assignment</option>
              </select>
            </div>

            <div>
              <label>Due Date</label>
              <input className="inputDashboard" type="date"
                value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
              <label>Due Time</label>
              <input className="inputDashboard" type="time"
                value={time} onChange={e => setTime(e.target.value)} />
            </div>

            {msg.text && (
              <p className={msg.type === "error" ? "msg-error" : "msg-success"}>
                {msg.text}
              </p>
            )}

            <div className="row">
              <button className="btn" onClick={handleSubmit}>
                {editId ? "Update Deadline" : "Add Deadline"}
              </button>
              {editId && (
                <button className="btn btn-outline" onClick={clearForm}>Cancel</button>
              )}
            </div>
          </div>
        </section>

        {/* Table Card */}
        <section className="card">
          <h2>Upcoming Deadlines</h2>

          {loading ? (
            <p className='text-muted'>Loading...</p>
          ) : sorted.length === 0 ? (
            <p className='text-muted'>No deadlines added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Due Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(d => (
                  <tr key={d._id}>
                    <td>{d.courseName}</td>
                    <td>{d.title}</td>
                    <td>
                      <span className={`type-tag type-${d.type.toLowerCase()}`}>
                        {d.type}
                      </span>
                    </td>
                    <td>{formatDate(d.date)} <DaysBadge dateStr={d.date} /></td>
                    <td>{d.time || "-"}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => startEdit(d)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Delete Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-card" role="dialog" aria-modal="true">
            <p>Are you sure you want to delete this deadline?</p>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default DeadlinesPage;
