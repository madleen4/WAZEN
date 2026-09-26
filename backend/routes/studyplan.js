const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const hours = [
  ...Array.from({ length: 18 }, (_, index) => 6 + index),
  ...Array.from({ length: 6 }, (_, index) => index)
];

function buildAvailableSlots(schedule) {
  const slots = [];

  days.forEach((day) => {
    hours.forEach((hour) => {

      const key = `${day.toLowerCase()}-${hour}`;

      if (schedule && schedule[key]) {
        slots.push({
          day,
          time: hour
        });
      }
    });
  });

  return slots;
}

module.exports = ({
  studyplan,
  availability,
  courses,
  deadlines
}) => {

  // GET study plan
  router.get("/", async (req, res) => {
    try {

      // Fetch only current user's study plan
      const planItems = await studyplan
        .find({ userId: req.user.id })
        .toArray();

      if (planItems.length > 0) {
        return res.json(planItems);
      }

      //  Fetch only current user's data
      const [availabilityDoc] = await availability
        .find({
          userId: req.user.id
        })
        .sort({ updatedAt: -1 })
        .limit(1)
        .toArray();

      // Only current user's courses
      const coursesList = await courses
        .find({ userId: req.user.id })
        .toArray();

      //  Only current user's deadlines
      const deadlinesList = await deadlines
        .find({ userId: req.user.id })
        .toArray();

      // REMOVED unnecessary debug console logs - sara

      if (!availabilityDoc || !coursesList.length) {
        return res.json([]);
      }

      const availableSlots = buildAvailableSlots(
        availabilityDoc.schedule || {}
      );

      if (availableSlots.length === 0) {
        return res.json([]);
      }

      //  Sort courses by priority and hours
      const priorityRank = (p) =>
        p === "High" ? 1 : p === "Medium" ? 2 : p === "Low" ? 3 : 999;

      const orderedCourses = [...coursesList].sort((a, b) => {
      const diff = priorityRank(a.priority) - priorityRank(b.priority);
      if (diff !== 0) return diff;
        return Number(b.hours || 0) - Number(a.hours || 0);
      });

      let slotIndex = 0;

      const generatedPlan = [];

      orderedCourses.forEach((course) => {

        const weeklyHours = Number(course.hours) || 2;

        for (
          let i = 0;
          i < weeklyHours && slotIndex < availableSlots.length;
          i += 1
        ) {

          const slot = availableSlots[slotIndex];

          // Match nearest deadline for this course
          const matchingDeadline = deadlinesList.find(
            (deadline) => deadline.courseName === course.name
          );

          generatedPlan.push({
            userId: req.user.id,

            courseName: course.name,

            weeklyHours,

            priorityRank: priorityRank[course.priority] || 999,

            day: slot.day,

            time: slot.time,

            //  Save nearest deadline if available
            deadline: matchingDeadline
              ? matchingDeadline.date
              : "",

            note: ""
          });

          slotIndex += 1;
        }
      });

      res.json(generatedPlan);

    } catch (error) {

      console.error("Study plan GET error:", error);

      res.status(500).json({
        error: "Failed to fetch study plan"
      });
    }
  });

  // POST new study plan item
  router.post("/", async (req, res) => {
    try {

      const {
        courseName,
        deadline,
        priority,
        weeklyHours,
        day,
        time,
        note
      } = req.body;

      if (!courseName || !day || !time) {
        return res.status(400).json({
          error: "courseName, day, and time are required"
        });
      }

      // Save userId
      const result = await studyplan.insertOne({
        userId: req.user.id,

        courseName,

        deadline: deadline || "",

        weeklyHours: weeklyHours || "",

        day,

        time,

        note: note || "",

        createdAt: new Date()
      });

      res.status(201).json({
        message: "Study plan item added successfully",
        insertedId: result.insertedId
      });

    } catch (error) {

      res.status(500).json({
        error: "Failed to add study plan item"
      });
    }
  });

  // PUT update study plan item
  router.put("/:id", async (req, res) => {
    try {

      const id = req.params.id;

      const {
        courseName,
        deadline,
        priority,
        weeklyHours,
        day,
        time,
        note
      } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid study plan id"
        });
      }

      // Required field validation
      if (!courseName || !day || !time) {
        return res.status(400).json({
          error: "courseName, day, and time are required"
        });
      }

      //  Update only logged-in user's item
      const result = await studyplan.updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.id
        },
        {
          $set: {
            courseName,

            deadline: deadline || "",

            weeklyHours: weeklyHours || "",

            priority: priority,

            day,

            time,

            note: note || ""
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Study plan item not found"
        });
      }

      res.json({
        message: "Study plan item updated successfully"
      });

    } catch (error) {

      res.status(500).json({
        error: "Failed to update study plan item"
      });
    }
  });

  // DELETE study plan item
  router.delete("/:id", async (req, res) => {
    try {

      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid study plan id"
        });
      }

      //  Delete only current user's item
      const result = await studyplan.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Study plan item not found"
        });
      }

      res.json({
        message: "Study plan item deleted successfully"
      });

    } catch (error) {

      res.status(500).json({
        error: "Failed to delete study plan item"
      });
    }
  });

  return router;
};