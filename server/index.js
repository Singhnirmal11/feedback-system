require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const db = require("./db");
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

function verifyToken(req,res,next)
{
  const authHeader=req.headers["authorization"];

  if(!authHeader){
    return res.status(403).json({message:"Token Required"});
  }
  const token=authHeader.split(" ")[1];
  jwt.verify(token,SECRET_KEY,(err,decoded) =>{
    if(err){
      return res.status(403).json({message:"Invalid token"});
    }

    req.user=decoded;
    next();
  });
}

function verifyAdmin(req,res,next){
  if(req.user.role!="admin"){
    return res.status(403).json({message:"Access denied. Admin only"});
  }
  next();
}

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

app.get("/dashboard",verifyToken,(req,res)=>{
  res.json({
    message:"Welcome to Dashboard",
    user:req.user
  });
});


app.listen(5001, () => {
  console.log("Server running on port 5001");
});
