import { useState } from "react";

function Login({ setIsLoggedIn }){
  const [email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  
  const handleLogin=async() =>{

    try{
      const response =await fetch ("http://localhost:5001/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          email:email,
          password:password
        })
      });

      const data=await response.json();
      console.log(data);  

      if(response.ok){
        alert("Login Successful");
        localStorage.setItem("token",data.token);
        setIsLoggedIn(true);
      }else{
        alert(data.message);
      }
    }

    catch(error){
      console.error("Error:", error); 
    }
  };
  return(
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br/> <br/>

      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br/> <br/>
      
      <button onClick={handleLogin}>Login</button>
    </div>
  );
} 

export default Login;