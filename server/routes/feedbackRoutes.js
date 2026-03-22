const express = require("express");
const router = express.Router();
const db = require("../config/db");

const verifyToken = require("../middleware/verifyToken");



router.post("/feedback", verifyToken, (req, res) => {
  const { faculty_id, rating, comment } = req.body;
  const student_id = req.user.id;

  if (!faculty_id || !rating) {
    return res.status(400).json({ message: "Faculty and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const checkFaculty = "SELECT * FROM faculties WHERE id = ?";
  db.query(checkFaculty, [faculty_id], (err, facultyResult) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (facultyResult.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const checkDuplicate = `
      SELECT * FROM feedback 
      WHERE student_id = ? AND faculty_id = ?
    `;

    db.query(checkDuplicate, [student_id, faculty_id], (err, duplicateResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (duplicateResult.length > 0) {
        return res.status(400).json({
          message: "You have already submitted feedback for this faculty"
        });
      }

      const insertQuery = `
        INSERT INTO feedback (student_id, faculty_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertQuery, [student_id, faculty_id, rating, comment], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({ message: "Feedback submitted successfully" });
      });
    });
  });
});


router.get("/faculties/:id/feedback", verifyToken, (req, res) => {
  const faculty_id = req.params.id;

  const query = `
    SELECT f.name, f.department, fb.rating, fb.comment
    FROM feedback fb
    JOIN faculties f ON fb.faculty_id = f.id
    WHERE f.id = ?
  `;

  db.query(query, [faculty_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No feedback found" });
    }

    const totalRatings = results.length;
    const averageRating =
      results.reduce((sum, item) => sum + item.rating, 0) / totalRatings;

    const cleanFeedback = results.map(item => ({
      rating: item.rating,
      comment: item.comment
    }));     

    res.json({
      faculty: {
        name: results[0].name,
        department: results[0].department
      },
      totalFeedback: totalRatings,
      averageFeedback: averageRating.toFixed(2),
      feedback: cleanFeedback
    });
  });
});

module.exports = router;