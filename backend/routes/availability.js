const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = (availabilityCollection) => {

  // GET all availability records for the logged-in user
  router.get("/", async (req, res) => {
    try {
      // Only fetch availability records that belong to the logged-in user
      const availability = await availabilityCollection
        .find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .toArray();

      res.json(availability);

    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch availability"
      });
    }
  });

  // POST - save new availability
  router.post("/", async (req, res) => {
    try {
      const { schedule } = req.body;

      if (!schedule || typeof schedule !== "object") {
        return res.status(400).json({
          error: "Schedule data is required"
        });
      }

      //  Save userId so every availability record belongs to one user
      const result = await availabilityCollection.insertOne({
        userId: req.user.id,
        schedule,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({
        message: "Availability saved successfully",
        insertedId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to save availability"
      });
    }
  });

  // PUT - update availability
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { schedule } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid availability id"
        });
      }

      if (!schedule || typeof schedule !== "object") {
        return res.status(400).json({
          error: "Schedule data is required"
        });
      }

      // Update only if the availability record belongs to logged-in user
      const result = await availabilityCollection.updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.id
        },
        {
          $set: {
            schedule,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Availability not found"
        });
      }

      res.json({
        message: "Availability updated successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to update availability"
      });
    }
  });

  // DELETE - delete availability
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid availability id"
        });
      }

      //  Delete only if the availability record belongs to logged-in user
      const result = await availabilityCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Availability not found"
        });
      }

      res.json({
        message: "Availability deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to delete availability"
      });
    }
  });

  return router;
};