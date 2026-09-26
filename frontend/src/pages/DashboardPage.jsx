
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiRequest from "../utils/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function daysFromToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr + "T00:00:00");
  target.setHours(0, 0, 0, 0);

  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `In ${diff} days`;
}

function calcStudyStreak(progressData) {
  if (!progressData.length) return 0;

  const completedDates = [
    ...new Set(
      progressData
        .filter((p) => p.status === "Completed")
        .map((p) => new Date(p.studyDate + "T00:00:00").toDateString())
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  if (!completedDates.length) return 0;

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const dateStr of completedDates) {
    const d = new Date(dateStr);

    if (d.toDateString() === current.toDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function calcWeekOverload(progressData) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekHours = progressData
    .filter((p) => new Date(p.studyDate + "T00:00:00") >= oneWeekAgo)
    .reduce((sum, p) => sum + Number(p.studyHours || 0), 0);

  if (weekHours > 20) return "High";
  if (weekHours > 10) return "Medium";
  return "Low";
}

function Dashboard() {
  const [statistics, setStatistics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [progress, setProgress] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [message, setMessage] = useState("");
  

  useEffect(() => {
    loadAll();
  }, []);



  async function loadAll() {
  try {
    const data = await apiRequest("/dashboard");

    const coursesArray = Array(data.coursesCount || 0).fill({});

    setStatistics(data.statistics);
    setNotifications(data.notifications || []);
    setCourses(coursesArray);
    setDeadlines(data.deadlines || []);
    setProgress(data.progress || []);

    generateAIAdvice(
      data.statistics,
      data.deadlines || [],
      coursesArray,
      data.progress || []
    );
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    setMessage("Failed to load dashboard data.");
  }
}

  async function generateAIAdvice(
    statsData,
    deadlinesData,
    coursesData,
    progressData
  ) {
    setLoadingAI(true);

    try {
      const response = await apiRequest("/ai/advice", {
        method: "POST",
        body: JSON.stringify({
          statistics: statsData,
          deadlines: deadlinesData,
          courses: coursesData,
          progress: progressData,
          studyStreak: calcStudyStreak(progressData),
        }),
      });

      setAiAdvice(response.advice);
    } catch (error) {
      setAiAdvice(
        "AI advice is currently unavailable. Focus on your nearest deadline and complete one short study session today."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  const nextDeadline = (() => {
    if (!deadlines.length) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      deadlines
        .filter((d) => d.date && new Date(d.date + "T00:00:00") >= today)
        .sort(
          (a, b) =>
            new Date(a.date + "T00:00:00") -
            new Date(b.date + "T00:00:00")
        )[0] || null
    );
  })();

  const nextSession = (() => {
    if (!progress.length) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      progress
        .filter(
          (p) =>
            p.status === "Planned" &&
            new Date(p.studyDate + "T00:00:00") >= today
        )
        .sort(
          (a, b) =>
            new Date(a.studyDate + "T00:00:00") -
            new Date(b.studyDate + "T00:00:00")
        )[0] || null
    );
  })();

  const weekHours = (() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return progress
      .filter(
        (p) =>
          p.status === "Completed" &&
          new Date(p.studyDate + "T00:00:00") >= oneWeekAgo
      )
      .reduce((sum, p) => sum + Number(p.studyHours || 0), 0);
  })();

  const studyStreak = calcStudyStreak(progress);
  const weekOverload = calcWeekOverload(progress);
  const recentNotifications = notifications.slice(0, 3);

  const chartData = [
    {
      name: "Done",
      value: statistics ? statistics.completed : 0,
    },
    {
      name: "Missed",
      value: statistics ? statistics.missed : 0,
    },
    {
      name: "Plan",
      value: statistics ? statistics.planned : 0,
    },
  ];

  const todayStr = new Date().toDateString();

  const todaySessions = progress.filter(
    (p) => new Date(p.studyDate + "T00:00:00").toDateString() === todayStr
  );

  return (
    <>
      <Navbar CurrentPage="dashboard" />

      <main className="wrap">
        <h1>Dashboard</h1>
        <p>Welcome back! Here is your study overview.</p>

        {message && <p className="message">{message}</p>}

        <section className="grid">
          <Link className="card" to="/progress">
            <h2>Total Hours Studied this Week</h2>
            <ul className="summary">
              <li className="cardLiLarge">
                <span className="dashboard-icon">⌛ {weekHours}h</span>
              </li>
            </ul>
          </Link>

          <Link className="card" to="/deadlines">
            <h2>Next Deadline</h2>
            <ul className="summary">
              {nextDeadline ? (
                <li className="cardLiSmall">
                  <span className="cardLiLarge">📅</span>
                  {nextDeadline.title}
                  <br />
                  <span style={{ fontWeight: 500 }}>
                    {daysFromToday(nextDeadline.date)}
                  </span>
                </li>
              ) : (
                <li className="cardLiSmall">No upcoming deadlines 🎉</li>
              )}
            </ul>
          </Link>

          <Link className="card productivity-card" to="/statistics">
            <h2>Productivity Chart</h2>

            {statistics ? (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 4, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />

                    <YAxis hide />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#d98cab"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ul className="summary">
                <li className="cardLiSmall">Loading...</li>
              </ul>
            )}
          </Link>

          <Link className="card" to="/statistics">
            <h2>Study Streak</h2>
            <ul className="summary">
              <li className="cardLiLarge">
                <span className="dashboard-icon">🔥 {studyStreak} Days</span>
              </li>
            </ul>
          </Link>
        </section>

        <section className="grid">
          <Link className="card" to="/statistics">
            <h2>Week Overload</h2>
            <ul className="summary">
              <li className="cardLiLarge">
                <span className="dashboard-icon">⚖️ {weekOverload}</span>
              </li>
            </ul>
          </Link>

          <Link className="card" to="/progress">
            <h2>Upcoming Session</h2>
            <ul className="summary">
              {nextSession ? (
                <li className="cardLiSmall">
                  <b>Next:</b> {nextSession.courseName}
                  <br />
                  <span style={{ fontWeight: 500 }}>
                    {daysFromToday(nextSession.studyDate)}
                  </span>
                  <br />
                  <span style={{ fontSize: "13px" }}>
                    {nextSession.studyHours}h — {nextSession.sessionTitle}
                  </span>
                </li>
              ) : (
                <li className="cardLiSmall">No planned sessions</li>
              )}
            </ul>
          </Link>

          <div className="card">
            <h2>Notifications</h2>
            <ul className="summary">
              {recentNotifications.length > 0 ? (
                recentNotifications.slice(0, 2).map((n) => (
                  <li key={n._id} className="Notifications">
                    <Link to="/notifications">
                      <span className="cardLiLarge">🔔</span>{" "}
                      {n.message || n.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="Notifications">No notifications yet.</li>
              )}
            </ul>
          </div>

          <Link className="card" to="/courses">
            <h2>Number of Courses</h2>
            <ul className="summary">
              <li className="cardLiLarge">
                <span className="dashboard-icon">📒 {courses.length}</span>
              </li>
            </ul>
          </Link>
        </section>

        <section className="card">
          <h2>Quick Action</h2>
          <ul className="inline-summary">
            <li className="cardLiLarge">
              <Link to="/availability">
                <span>🕒</span> Set Availability
              </Link>
            </li>
            <li className="cardLiLarge">
              <Link to="/deadlines">
                <span>📌</span> Add New Assignment
              </Link>
            </li>
            <li className="cardLiLarge">
              <Link to="/progress">
                <span>✅</span> Finish Assignment
              </Link>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>
            <span className="logo-text">Wazen</span> AI Advisor
          </h2>
          <ul className="summary">
            <li className="advise">
              {loadingAI
                ? "✨ Analyzing your progress..."
                : aiAdvice ||
                  "Keep going! Every study session brings you closer to your goals. 🌟"}
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>Today's Schedule</h2>

          {todaySessions.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Task</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {todaySessions.map((p) => (
                  <tr key={p._id}>
                    <td>{p.courseName}</td>
                    <td>{p.sessionTitle}</td>
                    <td>{p.studyHours}h</td>
                    <td>
                      <span className={p.status.toLowerCase()}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "left" }}>
              No sessions scheduled for today.
              <Link to="/progress" style={{ marginLeft: "6px" }}>
                Add one?
              </Link>
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;