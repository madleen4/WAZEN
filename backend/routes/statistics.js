const express = require("express");

const router = express.Router();

module.exports = (progressCollection) => {

  // GET statistics for the logged-in user
  router.get("/", async (req, res) => {
    try {

      //  Only calculate statistics from the logged-in user's progress records
      const progress = await progressCollection
        .find({ userId: req.user.id })
        .toArray();

      let completed = 0;
      let missed = 0;
      let planned = 0;
      let totalHours = 0;

      for (let i = 0; i < progress.length; i++) {
        if (progress[i].status === "Completed") {
          completed++;

          //  Safer number conversion
          totalHours += Number(progress[i].studyHours || 0);

        } else if (progress[i].status === "Missed") {
          missed++;

        } else {
          planned++;
        }
      }

      const totalSessions = progress.length;

      const completionRate =
        totalSessions === 0
          ? 0
          : Math.round((completed / totalSessions) * 100);

      res.json({
        totalSessions,
        completed,
        missed,
        planned,
        totalHours,
        completionRate
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to calculate statistics"
      });
    }
  });

  return router;
};