const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = (notificationsCollection) => {

  // GET all notifications for the logged-in user
  router.get("/", async (req, res) => {
    try {
      //  Only fetch notifications that belong to the logged-in user
      const notifications = await notificationsCollection
        .find({ userId: req.user.id })
        .toArray();

      res.json(notifications);

    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch notifications"
      });
    }
  });

  // POST - add new notification
  router.post("/", async (req, res) => {
    try {
      const { title, message, type, date } = req.body;

      if (!title || !message || !type || !date) {
        return res.status(400).json({
          error: "All notification fields are required"
        });
      }

      // Save userId so every notification belongs to one user
      const result = await notificationsCollection.insertOne({
        userId: req.user.id,
        title,
        message,
        type,
        date,
        isRead: false,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Notification added successfully",
        insertedId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to add notification"
      });
    }
  });

  // DELETE - delete notification
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid notification id"
        });
      }

      //  Delete only if the notification belongs to logged-in user
      const result = await notificationsCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Notification not found"
        });
      }

      res.json({
        message: "Notification deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to delete notification"
      });
    }
  });

  return router;
};