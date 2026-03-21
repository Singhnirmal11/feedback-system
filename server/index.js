require("dotenv").config();
const verifyToken = require("./middleware/verifyToken");
const verifyAdmin = require("./middleware/verifyAdmin");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const bcrypt = require("bcrypt");
const SECRET_KEY = process.env.JWT_SECRET;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/admin",verifyToken,verifyAdmin,(req,res) =>{
  res.json({
    message:"Welcome Admin"
  });
});

app.post("/register", async (req, res) => {
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


app.post("/login", (req, res) => {
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


app.post("/faculties",verifyToken,verifyAdmin,(req,res) =>{
  const {name,department}=req.body;

  if(!name || !department){
    return res.status(400).json({message:"All fields are required"});
  }

  const query=`
  INSERT into faculties(name,department) VALUES(?,?)`;

  db.query(query,[name,department],(err,result) =>{
    if(err){
      return res.status(500).json({message:"Database error"});
    }
    
    return res.status(201).json({message:"Faculty added successfully"});
  });
});


app.get("/faculties", verifyToken, (req, res) => {
  const query = "SELECT * FROM faculties";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

app.post("/feedback",verifyToken,(req,res) =>{
  const{faculty_id,rating,comment}=req.body;
  const student_id=req.user.id;


  if(!faculty_id || !rating){
    return res.status(400).json({message:"Faculty and rating are required"});
  }

  if(rating<1 || rating>5){
    return res.status(400).json({message:"Rating must be between 1 and 5"});
  }

  const checkFaculty="SELECT * FROM faculties WHERE id=?";
  db.query(checkFaculty,[faculty_id],(err,facultyResult) =>{
    if(err){
      return res.status(500).json({message:"Database Error"});
    }

    if(facultyResult.length===0){
      return res.status(404).json({message:"Faculty not found"});
    }

    const checkDuplicate=`SELECT * FROM feedback WHERE student_id=? AND faculty_id=?`;

    db.query(checkDuplicate,[student_id,faculty_id],(err,duplicateResult) =>{
      if(err){
        return res.status(500).json({message:"Database error"});
      }

      if(duplicateResult.length>0){
        return res.status(400).json({message:"You have already submitted feedback for this faculty"});
      }

      const insertQuery=`INSERT INTO feedback (student_id, faculty_id, rating, comment)
      VALUES(?,?,?,?)`;

      db.query(insertQuery,[student_id,faculty_id,rating,comment],(err,result) =>{
        if(err){
          return res.status(500).json({message:"Database error"});
        }

        res.status(201).json({message:"Feedback Submitted Successfully"});
      });
    });
  });
});

app.get("/faculties/:id/feedback",verifyToken,(req,res) =>{
  const faculty_id=req.params.id;

  const query=`SELECT f.name ,f.department, fb.rating, fb.comment FROM feedback fb JOIN faculties f ON fb.faculty_id=f.id WHERE f.id=?`;
  db.query(query,[faculty_id],(err,results) =>{

  if(err){
    console.log(err);
  return res.status(500).json({message:"Database error"});
  }

  if(results.length===0){
    return res.status(404).json({message:"Feedback not found"});
  }

  const totalRatings=results.length;
  const averageRating= results.reduce((sum,item)=>sum+item.rating,0)/totalRatings;

    res.json({

      faculty:{
        name:results[0].name,
        department:results[0].department
      },
      totalFeedback:totalRatings,
      averageFeedback:averageRating.toFixed(2),
      feedback:results
    });
  });
});

app.get("/dashboard",verifyToken,(req,res)=>{
  res.json({
    message:"Welcome to Dashboard",
    user:req.user
  });
});

// for checking the server status

app.listen(5001, () => {
  console.log("Server running on port 5001");
});

