const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = (progressCollection) => {

  // GET all progress records for the logged-in user
  router.get("/", async (req, res) => {
    try {
      //  Only fetch progress records that belong to the logged-in user
      const progress = await progressCollection
        .find({ userId: req.user.id })
        .toArray();

      res.json(progress);

    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch progress data"
      });
    }
  });

  // POST - add new progress record
  router.post("/", async (req, res) => {
    try {
      const {
        courseName,
        sessionTitle,
        status,
        studyHours,
        studyDate
      } = req.body;

      if (!courseName || !sessionTitle || !status || !studyDate) {
        return res.status(400).json({
          error: "courseName, sessionTitle, status, and studyDate are required"
        });
      }

      //  Convert studyHours once so validation is safer
      const numericStudyHours = Number(studyHours);

      // Prevent empty, negative, or non-number study hours
      if (
        studyHours === undefined ||
        studyHours === "" ||
        Number.isNaN(numericStudyHours) ||
        numericStudyHours < 0
      ) {
        return res.status(400).json({
          error: "Study hours must be a valid number"
        });
      }

      //  Save userId so every progress record belongs to one user
      const result = await progressCollection.insertOne({
        userId: req.user.id,
        courseName,
        sessionTitle,
        status,
        studyHours: numericStudyHours,
        studyDate,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Progress added successfully",
        insertedId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to add progress"
      });
    }
  });

  // PUT - update progress status
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid progress id"
        });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          error: "Status is required"
        });
      }

      //  Update only if the progress record belongs to logged-in user
      const result = await progressCollection.updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.id
        },
        {
          $set: {
            status
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Progress record not found"
        });
      }

      res.json({
        message: "Progress updated successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to update progress"
      });
    }
  });

  // DELETE - delete progress record
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid progress id"
        });
      }

      //  Delete only if the progress record belongs to logged-in user
      const result = await progressCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Progress record not found"
        });
      }

      res.json({
        message: "Progress deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to delete progress"
      });
    }
  });

  return router;
};