import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiRequest from "../utils/api";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 18 }, (_, index) => 6 + index);

function formatHour(hour) {
  if (hour === 12) return "12 PM";
  if (hour === 0 || hour === 24) return "12 AM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function AvailabilityPage() {
  const [schedule, setSchedule] = useState({});
  const [availabilityId, setAvailabilityId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  async function loadAvailability() {
    try {
      const data = await apiRequest("/availability");
      if (Array.isArray(data) && data.length > 0) {
        setAvailabilityId(data[0]._id);
        setSchedule(data[0].schedule || {});
      }
    } catch (error) {
      setMessage("Unable to load availability.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSlot(day, hour) {
    const key = `${day.toLowerCase()}-${hour}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  async function saveAvailability() {
    try {
      const payload = { schedule };
      if (availabilityId) {
        await apiRequest(`/availability/${availabilityId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setMessage("Availability updated successfully.");
      } else {
        const result = await apiRequest("/availability", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (result.insertedId) {
          setAvailabilityId(result.insertedId);
        }
        setMessage("Availability saved successfully.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Navbar CurrentPage="availability" />

      <main className="wrap">
        <h1>Weekly availability</h1>

        <div className="card">
          {message && <p className="message">{message}</p>}
          {loading ? (
            <p>Loading availability...</p>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); saveAvailability(); }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    {days.map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour) => (
                    <tr key={hour}>
                      <td>{formatHour(hour)}</td>
                      {days.map((day) => {
                        const key = `${day.toLowerCase()}-${hour}`;
                        return (
                          <td key={key}>
                            <input
                              type="checkbox"
                              checked={Boolean(schedule[key])}
                              onChange={() => toggleSlot(day, hour)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="submit" className="btn">
                Save Availability
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default AvailabilityPage;
