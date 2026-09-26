const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const deadlinesRoutes = require("./routes/deadlines");
const availabilityRoutes = require("./routes/availability");
const studyplanRoutes = require("./routes/studyplan");
const progressRoutes = require("./routes/progress");
const statisticsRoutes = require("./routes/statistics");
const notificationsRoutes = require("./routes/notifications");
const dashboardRoutes = require("./routes/dashboard");

// Import protect middleware to protect private routes
const protect = require("./middleware/protect");

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.GROUP_DB_NAME;

const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();

    const db = client.db(dbName);

    const collections = {
      users: db.collection("users"),
      courses: db.collection("courses"),
      deadlines: db.collection("deadlines"),
      availability: db.collection("availability"),
      studyplan: db.collection("studyplan"),
      progress: db.collection("progress"),
      notifications: db.collection("notifications")
    };

    console.log("Connected to MongoDB Atlas");
    console.log(`Using database: ${dbName}`);

    app.get("/", (req, res) => {
      res.send(`Wazen backend is running. Current database: ${dbName}`);
    });

    // Public route: users do not need a token to register or login
    app.use("/auth", authRoutes(collections.users));

    //Protected routes require a valid JWT token
    app.use("/courses", protect, coursesRoutes(collections.courses));
    app.use("/deadlines", protect, deadlinesRoutes(collections.deadlines));
    app.use("/availability", protect, availabilityRoutes(collections.availability));
    app.use("/studyplan", protect, studyplanRoutes(collections));
    app.use("/progress", protect, progressRoutes(collections.progress));
    app.use("/statistics", protect, statisticsRoutes(collections.progress));
    app.use("/notifications", protect, notificationsRoutes(collections.notifications));
    app.use("/dashboard", protect, dashboardRoutes(collections));

    //  AI advice route is protected because it uses student data
    app.post("/ai/advice", protect, async (req, res) => {
      try {
        const {
          statistics,
          deadlines,
          courses,
          progress,
          studyStreak
        } = req.body;

        const upcomingDeadlines = (deadlines || [])
          .slice(0, 3)
          .map((deadline) => `${deadline.title} due on ${deadline.date}`)
          .join(", ");

        const prompt = `
You are Wazen AI Advisor, a helpful study assistant for university students.

Student data:
- Completion rate: ${statistics?.completionRate || 0}%
- Completed sessions: ${statistics?.completed || 0}
- Missed sessions: ${statistics?.missed || 0}
- Planned sessions: ${statistics?.planned || 0}
- Total study hours: ${statistics?.totalHours || 0}
- Study streak: ${studyStreak || 0} days
- Courses count: ${courses?.length || 0}
- Upcoming deadlines: ${upcomingDeadlines || "None"}

Write one short personalized study advice.
Make it practical, specific, and encouraging.
Maximum 2 sentences.
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        res.json({
          advice:
            response.text ||
            "Keep going and stay consistent with your study plan."
        });

      } catch (error) {
        res.status(500).json({
          error: "Failed to generate AI advice"
        });
      }
    });

    //  Handles wrong routes 
    app.use((req, res) => {
      res.status(404).json({
        error: "Route not found"
      });
    });

    //  ------
    app.use((error, req, res, next) => {
      res.status(500).json({
        error: "Internal server error"
      });
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();