import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StudyHoursChart from "../components/StudyHoursChart";
import apiRequest from "../utils/api";

function StatisticsPage() {
  const [statistics, setStatistics] = useState(null);
  const [message, setMessage] = useState("");

  async function loadStatistics() {
    try {
      const data = await apiRequest("/statistics");
      setStatistics(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadStatistics();
  }, []);

  return (
    <>
      <Navbar CurrentPage="statistics" />

      <main className="wrap">
        <div className="card">
          <h1>Statistics</h1>
          <p>View study performance and completion rates.</p>

          {message && <p className="message">{message}</p>}

          {statistics && (
            <>
              <ul className="inline-summary">
                <li><span>{statistics.totalSessions}</span>Total Sessions</li>
                <li><span>{statistics.completed}</span>Completed</li>
                <li><span>{statistics.missed}</span>Missed</li>
                <li><span>{statistics.planned}</span>Planned</li>
                <li><span>{statistics.totalHours}</span>Study Hours</li>
                <li><span>{statistics.completionRate}%</span>Completion</li>
              </ul>

              <StudyHoursChart statistics={statistics} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default StatisticsPage;