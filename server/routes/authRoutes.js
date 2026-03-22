const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token
    });
  });
});

module.exports = router;