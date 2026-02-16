
const express=require("express"); //tells express framework is needed
const cors= require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Server is running");
});

app.listen(5001,() =>{
  console.log("Server running on port 5001");
}); 