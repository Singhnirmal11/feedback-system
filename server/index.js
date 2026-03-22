require("dotenv").config();
const verifyToken = require("./middleware/verifyToken");
const verifyAdmin = require("./middleware/verifyAdmin");
const authRoutes = require("./routes/authRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const bcrypt = require("bcrypt");
const SECRET_KEY = process.env.JWT_SECRET;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/", authRoutes);
app.use("/", facultyRoutes);
app.use("/", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/admin",verifyToken,verifyAdmin,(req,res) =>{
  res.json({
    message:"Welcome Admin"
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

