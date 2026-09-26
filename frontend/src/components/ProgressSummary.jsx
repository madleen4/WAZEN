function ProgressSummary({ progressData, updateStatus, deleteProgress }) {
  let completed = 0;
  let missed = 0;
  let planned = 0;
  let totalHours = 0;

  for (let i = 0; i < progressData.length; i++) {
    if (progressData[i].status === "Completed") {
      completed++;
      totalHours += Number(progressData[i].studyHours);
    } else if (progressData[i].status === "Missed") {
      missed++;
    } else {
      planned++;
    }
  }

  const totalSessions = progressData.length;

  const completionRate =
    totalSessions === 0
      ? 0
      : Math.round((completed / totalSessions) * 100);

  let progressTrend = "Stable";

  if (completionRate >= 70) {
    progressTrend = "Improving";
  } else if (completionRate < 40 && totalSessions > 0) {
    progressTrend = "Declining";
  }

  return (
    <div>
      <ul className="inline-summary">
        <li>
          <span>{totalSessions}</span>
          Total Sessions
        </li>

        <li>
          <span>{completed}</span>
          Completed
        </li>

        <li>
          <span>{missed}</span>
          Missed
        </li>

        <li>
          <span>{planned}</span>
          Planned
        </li>

        <li>
          <span>{totalHours}</span>
          Study Hours
        </li>

        <li>
          <span>{completionRate}%</span>
          Completion Rate
        </li>
      </ul>

      <div className="card">
        <h2>Progress Trend</h2>
        <p className={`trend ${progressTrend.toLowerCase()}`}>
          {progressTrend}
        </p>
      </div>

      {progressData.length === 0 ? (
        <p className="message">No progress records yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Session</th>
              <th>Date</th>
              <th>Status</th>
              <th>Hours</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {progressData.map((session) => (
              <tr key={session._id}>
                <td>{session.courseName}</td>
                <td>{session.sessionTitle}</td>
                <td>{session.studyDate}</td>
                <td>{session.status}</td>
                <td>{session.studyHours}</td>
                <td>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => updateStatus(session._id, "Completed")}
                  >
                    Completed
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => updateStatus(session._id, "Missed")}
                  >
                    Missed
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => deleteProgress(session._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProgressSummary;