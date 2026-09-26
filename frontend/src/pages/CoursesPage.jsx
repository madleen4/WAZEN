import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiRequest from "../utils/api";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [hours, setHours] = useState("");
  const [priority, setPriority] = useState("High");
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await apiRequest("/courses");
      setCourses(data);
    } catch (err) {
      showMessage("Failed to load courses.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  }

  function clearForm() {
    setName(""); setCode(""); setHours(""); setPriority("High");
    setEditId(null);
  }

  async function handleSubmit() {
    if (!name.trim() || !code.trim()) {
      showMessage("Please fill in Course Name and Course Code.", "error");
      return;
    }
    const h = parseInt(hours);
    if (isNaN(h) || h < 1 || h > 6) {
      showMessage("Credit Hours must be between 1 and 6.", "error");
      return;
    }

    try {
      if (editId) {
        await apiRequest(`/courses/${editId}`, {
          method: "PUT",
          body: JSON.stringify({ name, code, hours: h, priority })
        });
        showMessage("Course updated successfully!", "success");
      } else {
        await apiRequest("/courses", {
          method: "POST",
          body: JSON.stringify({ name, code, hours: h, priority })
        });
        showMessage("Course added successfully!", "success");
      }
      await loadCourses();
      clearForm();
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  function startEdit(c) {
    setName(c.name); setCode(c.code);
    setHours(c.hours.toString()); setPriority(c.priority);
    setEditId(c._id);
  }

  function confirmDelete(id) {
    setDeleteId(id);
    setShowModal(true);
  }

  async function handleDelete() {
    try {
      await apiRequest(`/courses/${deleteId}`, { method: "DELETE" });
      await loadCourses();
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      showMessage("Failed to delete course.", "error");
    }
  }

  return (
    <>
      <Navbar CurrentPage="courses" />

      <main className="wrap">
        <h1>Courses</h1>

        {/* Form Card */}
        <section >
          <div className="card">
            <h2>{editId ? "Edit Course" : "Add New Course"}</h2>

            <div>
              <label>Course Name</label>
              <input className="inputDashboard" type="text"
                placeholder="e.g., Web Development"
                value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label>Course Code</label>
              <input className="inputDashboard" type="text"
                placeholder="e.g., SWE381"
                value={code} onChange={e => setCode(e.target.value)} />
            </div>

            <div>
              <label>Credit Hours</label>
              <input className="inputDashboard" type="number" min="1" max="6"
                placeholder="1 – 6"
                value={hours} onChange={e => setHours(e.target.value)} />
            </div>

            <div>
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {msg.text && (
              <p className={msg.type === "error" ? "msg-error" : "msg-success"} role={msg.type === "error" ? "alert" : "status"}>
                {msg.text}
              </p>
            )}

            <div className="row">
              <button className="btn" onClick={handleSubmit}>
                {editId ? "Update Course" : "Add Course"}
              </button>
              {editId && (
                <button className="btn btn-outline" onClick={clearForm}>Cancel</button>
              )}
            </div>
          </div>
        </section>

        {/* Table Card */}
        <section className="card">
          <h2>Your Courses</h2>

          {loading ? (
            <p className='text-muted'>Loading...</p>
          ) : courses.length === 0 ? (
            <p className='text-muted'>No courses added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Credit Hours</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.code}</td>
                    <td>{c.hours}</td>
                    <td>{c.priority}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(c._id)}>Delete</button>
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
            <p>Are you sure you want to delete this course?</p>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default CoursesPage;
