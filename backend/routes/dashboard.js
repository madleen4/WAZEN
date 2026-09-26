const express = require("express");

const router = express.Router();

module.exports = (collections) => {

  router.get("/", async (req, res) => {
    try {
      //  Use the logged-in user's id from protect middleware
      const userId = req.user.id;

      // Dashboard reads only the current user's data
      const courses = await collections.courses.find({ userId }).toArray();
      const deadlines = await collections.deadlines.find({ userId }).toArray();
      const progress = await collections.progress.find({ userId }).toArray();
      const notifications = await collections.notifications.find({ userId }).toArray();

      let completed = 0;
      let missed = 0;
      let planned = 0;

      let completedHours = 0;
      let totalScheduledHours = 0;

      progress.forEach((session) => {
        const hours = Number(session.studyHours || 0);

        totalScheduledHours += hours;

        if (session.status === "Completed") {
          completed++;
          completedHours += hours;
        } else if (session.status === "Missed") {
          missed++;
        } else {
          planned++;
        }
      });

      const totalSessions = progress.length;

      const completionRate =
        totalSessions === 0
          ? 0
          : Math.round((completed / totalSessions) * 100);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextDeadline =
        deadlines
          .filter(
            (deadline) =>
              deadline.date &&
              new Date(deadline.date + "T00:00:00") >= today
          )
          .sort(
            (a, b) =>
              new Date(a.date + "T00:00:00") -
              new Date(b.date + "T00:00:00")
          )[0] || null;

      const nextSession =
        progress
          .filter(
            (session) =>
              session.status === "Planned" &&
              session.studyDate &&
              new Date(session.studyDate + "T00:00:00") >= today
          )
          .sort(
            (a, b) =>
              new Date(a.studyDate + "T00:00:00") -
              new Date(b.studyDate + "T00:00:00")
          )[0] || null;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      oneWeekAgo.setHours(0, 0, 0, 0);

      const completedWeekHours = progress
        .filter(
          (session) =>
            session.status === "Completed" &&
            session.studyDate &&
            new Date(session.studyDate + "T00:00:00") >= oneWeekAgo
        )
        .reduce(
          (sum, session) => sum + Number(session.studyHours || 0),
          0
        );

      const scheduledWeekHours = progress
        .filter(
          (session) =>
            session.studyDate &&
            new Date(session.studyDate + "T00:00:00") >= oneWeekAgo
        )
        .reduce(
          (sum, session) => sum + Number(session.studyHours || 0),
          0
        );

      res.json({
        statistics: {
          totalSessions,
          completed,
          missed,
          planned,
          totalHours: completedHours,
          completedHours,
          totalScheduledHours,
          completionRate
        },

        coursesCount: courses.length,
        deadlines,
        progress,
        notifications: notifications.slice(0, 3),
        nextDeadline,
        nextSession,

        // completed hours this week
        weekHours: completedWeekHours,

        // all scheduled hours this week
        scheduledWeekHours
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to load dashboard data"
      });
    }
  });

  return router;
};