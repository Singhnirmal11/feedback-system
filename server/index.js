
const express=require("express"); //tells express framework is needed
const cors= require("cors");
const db=require("./db");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Server is running");
});

const bcrypt=require("bcrypt");
app.post("/register",async(req,res) =>{
  const {name,email,password}=req.body;
  
  try{
    const hashedPassword= await bcrypt.hash(password,10);

    const query=`
      INSERT INTO users(name,email,password)
      VALUES (?,?,?)
      `;

    db.query(query,[name,email,hashedPassword],(err,result) =>{
      if(err){
        console.error(err);
        return res.status(500).json({message:"Database error"});
      }

      res.status(201).json({message:"User Registered Successfully"});
    });
  }
  catch(error){
    res.status(500).json({message:"Server error"});
  }
});

app.listen(5001,() =>{
  console.log("Server running on port 5001");
}); 

