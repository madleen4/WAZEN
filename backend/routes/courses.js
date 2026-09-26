const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = (coursesCollection) => {

  // GET all courses for the logged-in user
  router.get("/", async (req, res) => {
    try {
      //  Only fetch courses that belong to the logged-in user
      const courses = await coursesCollection
        .find({ userId: req.user.id })
        .toArray();

      res.json(courses);

    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch courses"
      });
    }
  });

  // POST - add new course
  router.post("/", async (req, res) => {
    try {
      const { name, code, hours, priority } = req.body;

      if (!name || !code || !hours || !priority) {
        return res.status(400).json({
          error: "All fields are required"
        });
      }

      //  Prevent invalid number values
      if (Number(hours) <= 0) {
        return res.status(400).json({
          error: "Course hours must be greater than 0"
        });
      }

      //  Check duplicate course code only for this logged-in user
      const existing = await coursesCollection.findOne({
        code: code.toUpperCase(),
        userId: req.user.id
      });

      if (existing) {
        return res.status(409).json({
          error: "A course with this code already exists"
        });
      }

      //  Save userId so every course belongs to one user
      const result = await coursesCollection.insertOne({
        userId: req.user.id,
        name,
        code: code.toUpperCase(),
        hours: Number(hours),
        priority,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Course added successfully",
        insertedId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to add course"
      });
    }
  });

  // PUT - update course
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid course id"
        });
      }

      const { name, code, hours, priority } = req.body;

      // Validate fields before using code.toUpperCase()
      if (!name || !code || !hours || !priority) {
        return res.status(400).json({
          error: "All fields are required"
        });
      }

      //  Prevent invalid number values
      if (Number(hours) <= 0) {
        return res.status(400).json({
          error: "Course hours must be greater than 0"
        });
      }

      // Update only if the course belongs to logged-in user
      const result = await coursesCollection.updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.id
        },
        {
          $set: {
            name,
            code: code.toUpperCase(),
            hours: Number(hours),
            priority
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: "Course not found"
        });
      }

      res.json({
        message: "Course updated successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to update course"
      });
    }
  });

  // DELETE - delete course
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid course id"
        });
      }

      //  Delete only if the course belongs to logged-in user
      const result = await coursesCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Course not found"
        });
      }

      res.json({
        message: "Course deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to delete course"
      });
    }
  });

  return router;
};