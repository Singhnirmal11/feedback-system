const mysql= require ("mysql2");

const db=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Nns@1234",
  database:"feedback_system"
});

db.connect((err) =>{
  if(err){
    console.log("Database connection failed",err);
    return;
  }
  console.log("MySQL Connected");
});
module.exports=db;