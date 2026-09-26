const express = require("express");

//  bcrypt hashes passwords before saving them
const bcrypt = require("bcrypt");

// jsonwebtoken creates login tokens
const jwt = require("jsonwebtoken");

const router = express.Router();

module.exports = (usersCollection) => {

  // REGISTER ------------------------------------------------
  router.post("/register", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender
      ) {
        return res.status(400).json({
          error: "All fields are required"
        });
      }

      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          error: "Email already exists"
        });
      }

      //  Hash password instead of storing plain-text password
      const hashedPassword = await bcrypt.hash(password, 10);

      //  Save hashedPassword, not password
      const result = await usersCollection.insertOne({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        gender,
        createdAt: new Date()
      });

      //  Create JWT token after successful registration
      const token = jwt.sign(
        {
          id: result.insertedId.toString(),
          email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

      //  Return token and user data
      res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
          id: result.insertedId,
          firstName,
          email
        }
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to register user"
      });
    }
  });

  // LOGIN ------------------------------------------------
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required"
        });
      }

      //  Find user by email only, not email + password
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password"
        });
      }

      //  Compare entered password with hashed password in database
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        return res.status(401).json({
          error: "Invalid email or password"
        });
      }

      //  Create JWT token after successful login
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

      //  Return token with user data
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          email: user.email
        }
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to login"
      });
    }
  });

  return router;
};