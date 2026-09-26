import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiRequest from "../utils/api";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = [...Array.from({ length: 18 }, (_, index) => 6 + index), ...Array.from({ length: 6 }, (_, index) => index)];

function StudyplanPage() {
    const [courses, setCourses] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [planItems, setPlanItems] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudyplanData();
    }, []);

    async function loadStudyplanData() {
        try {
            const [coursesRes, deadlinesRes, planRes] = await Promise.all([
                apiRequest("/courses"),
                apiRequest("/deadlines"),
                apiRequest("/studyplan")
            ]);

            const coursesData = Array.isArray(coursesRes) ? coursesRes : [];
            const deadlinesData = Array.isArray(deadlinesRes) ? deadlinesRes : [];
            const planData = Array.isArray(planRes) ? planRes : [];

            setCourses(coursesData.map((course) => ({
                name: course.name || course.courseName || "Untitled",
                weeklyHours: course.hours || course.weeklyHours || "N/A",
                priority: course.priority || 999
            })));

            setCourses((prev) => prev.sort((a, b) => {
                const priorityA = a.priority === "High" ? 1 : a.priority === "Medium" ? 2 : a.priority === "Low" ? 3 : 999;
                const priorityB = b.priority === "High" ? 1 : b.priority === "Medium" ? 2 : b.priority === "Low" ? 3 : 999;
                return priorityA - priorityB;
            }));

            setDeadlines(deadlinesData.map((item) => ({
                name: item.courseName || item.name || "Untitled",
                deadline: item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD",
                dateObj: item.date ? new Date(item.date) : null,
                dueHour: item.time ? parseInt(item.time.split(":")[0]) : 6, // ← extract hour from "HH:MM"
                weeklyHours: "-"
            })));

            setPlanItems(planData.map((item) => ({
                day: item.day,
                time: Number(item.time),
                course: item.courseName || item.course || "Study"
            })));

            if (Array.isArray(planData) && planData.length === 0) {
                setMessage("No study plan items found yet. Add availability and courses to generate a schedule.");
            }
        } catch (error) {
            setMessage(error.message || "Failed to load study plan data.");
        } finally {
            setLoading(false);
        }
    }

    function getScheduledCourse(day, hour) {
        const item = planItems.find((plan) => plan.day === day && plan.time === hour);
        return item ? item.course : "";
    }

    function getDeadlinesForDay(day) {
        const dayIndex = days.indexOf(day);
        if (dayIndex === -1) return [];

        const today = new Date();
        const dayOfWeek = today.getDay();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - dayOfWeek + dayIndex);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        return deadlines.filter((deadline) => {
            if (!deadline.dateObj) return false;
            const deadlineDate = new Date(deadline.dateObj);
            deadlineDate.setHours(0, 0, 0, 0);
            return deadlineDate >= targetDate && deadlineDate < nextDay;
        });
    }
    
    function getDeadlineDueAtHour(day, hour) {
        const dayDeadlines = getDeadlinesForDay(day);
        return dayDeadlines.find((d) => d.dueHour === hour) || null;
    }

    function getDeadlinesForWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const sundayOfWeek = new Date(today);
        sundayOfWeek.setDate(today.getDate() - dayOfWeek);
        sundayOfWeek.setHours(0, 0, 0, 0);

        const saturdayOfWeek = new Date(sundayOfWeek);
        saturdayOfWeek.setDate(sundayOfWeek.getDate() + 6);
        saturdayOfWeek.setHours(23, 59, 59, 999);

        return deadlines.filter((deadline) => {
            if (!deadline.dateObj) return false;
            return deadline.dateObj >= sundayOfWeek && deadline.dateObj <= saturdayOfWeek;
        });
    }

    function formatHour(hour) {
        if (hour === 12) return "12 PM";
        if (hour === 0 || hour === 24) return "12 AM";
        return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
    }

    return (
        <>
            <Navbar CurrentPage="studyplan" />

            <main className="wrap studyplan-page">
                <h1>Weekly Study Plan</h1>

                <section className="card">
                    <h2>Your Courses and Deadlines</h2>
                    {courses.length === 0 && deadlines.length === 0 ? (
                        <p className="message">No course or deadline data is available yet.</p>
                    ) : (
                       
                        <div className="studyplan-grid">
                            {courses.map((course, index) => (
                                <div className="studyplan-mini-card" key={`course-${index}`}>
                                    <h3>{course.name}</h3>
                                    <p>Weekly Hours: {course.weeklyHours}</p>
                                    <p>Priority: {course.priority}</p>
                                </div>
                            ))} 
                          
                           <br />
                           
                            {deadlines.map((deadline, index) => (
                                <div className="studyplan-mini-card" key={`deadline-${index}`}>
                                    <h3>{deadline.name}</h3>
                                    <p>Due: {deadline.deadline}</p>
                                </div>
                            ))} 
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>Allocated Study Plan</h2>
                    <p>This plan is generated based on your availability, course load, and deadlines.</p>

                    {message && <p className="message">{message}</p>}

                    {loading ? (
                        <p>Loading study plan...</p>
                    ) : planItems.length === 0 ? (
                        <p className="message">There are no scheduled study sessions yet.</p>
                    ) : (
                        <>
                            {getDeadlinesForWeek().length > 0 && (
                                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
                                    <h4 style={{ marginTop: 0, color: "#856404" }}>📌 Deadlines This Week:</h4>
                                    {getDeadlinesForWeek().map((deadline, idx) => (
                                        <p key={idx} style={{ margin: "5px 0", color: "#856404" }}>
                                            <strong>{deadline.name}</strong> - Due {deadline.deadline}
                                        </p>
                                    ))}
                                </div>
                            )}
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
                                                const courseName = getScheduledCourse(day, hour);
                                                const deadline = getDeadlineDueAtHour(day, hour); // ← uses hour, not just day
                                                return (
                                                    <td key={`${day}-${hour}`} className={courseName ? "scheduled" : ""}>
                                                        {courseName && <div>{courseName}</div>}
                                                        {deadline && (
                                                            <div style={{
                                                                fontSize: "11px",
                                                                backgroundColor: "#ff4d4d",
                                                                color: "#fff",
                                                                borderRadius: "4px",
                                                                padding: "2px 5px",
                                                                marginTop: "3px"
                                                            }}>
                                                                📌 {deadline.name} due
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default StudyplanPage;
