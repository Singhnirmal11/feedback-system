const express = require("express");
const router = express.Router();
const db = require("../config/db");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");


router.post("/faculties", verifyToken, verifyAdmin, (req, res) => {
  const { name, department } = req.body;

  if (!name || !department) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
    INSERT INTO faculties (name, department)
    VALUES (?, ?)
  `;

  db.query(query, [name, department], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "Faculty added successfully" });
  });
});


router.get("/faculties", verifyToken, (req, res) => {
  const query = "SELECT * FROM faculties";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

module.exports = router;