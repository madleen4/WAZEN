function StudyHoursChart({ statistics }) {
  const completedWidth = `${statistics.completionRate}%`;

  return (
    <div className="card">
      <h2>Completion Progress</h2>

      <p>
        {statistics.completed} out of {statistics.totalSessions} sessions completed.
      </p>

      <div
        style={{
          width: "100%",
          backgroundColor: "#fff9fc",
          borderRadius: "12px",
          border: "1px solid #f3d9e5",
          overflow: "hidden",
          height: "30px"
        }}
      >
        <div
          style={{
            width: completedWidth,
            backgroundColor: "#d98cab",
            height: "30px",
            textAlign: "center",
            color: "white",
            fontWeight: "bold"
          }}
        >
          {statistics.completionRate}%
        </div>
      </div>
    </div>
  );
}

export default StudyHoursChart;