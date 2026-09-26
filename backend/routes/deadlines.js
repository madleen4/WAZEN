const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = (deadlinesCollection) => {

  // GET all deadlines for the logged-in user
  router.get("/", async (req, res) => {
    try {
      //  Only fetch deadlines that belong to the logged-in user
      const deadlines = await deadlinesCollection
        .find({ userId: req.user.id })
        .toArray();

      res.json(deadlines);

    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch deadlines"
      });
    }
  });

  // POST - add new deadline
  router.post("/", async (req, res) => {
    try {
      const { courseName, title, type, date, time } = req.body;

      if (!courseName || !title || !type || !date) {
        return res.status(400).json({
          error: "courseName, title, type, and date are required"
        });
      }

      //  Save userId so every deadline belongs to one user
      const result = await deadlinesCollection.insertOne({
        userId: req.user.id,
        courseName,
        title,
        type,
        date,
        time: time || "",
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Deadline added successfully",
        insertedId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to add deadline"
      });
    }
  });

  // PUT - update deadline
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid deadline id"
        });
      }

      const { courseName, title, type, date, time } = req.body;

      // Validate fields before updating
      if (!courseName || !title || !type || !date) {
        return res.status(400).json({
          error: "courseName, title, type, and date are required"
        });
      }

      //  Update only if the deadline belongs to logged-in user
      const result = await deadlinesCollection.updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.id
        },
        {
          $set: {
            courseName,
            title,
            type,
            date,
            time: time || ""
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Deadline not found"
        });
      }

      res.json({
        message: "Deadline updated successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to update deadline"
      });
    }
  });

  // DELETE - delete deadline
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid deadline id"
        });
      }

      //  Delete only if the deadline belongs to logged-in user
      const result = await deadlinesCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Deadline not found"
        });
      }

      res.json({
        message: "Deadline deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to delete deadline"
      });
    }
  });

  return router;
};