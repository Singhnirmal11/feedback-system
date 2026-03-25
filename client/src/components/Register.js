import { useState } from "react";

function Register({ setShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful..");
        setShowLogin(true);
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Enter name"
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>Register</button>

      <p>
        Already have an account?{" "}
        <button onClick={() => setShowLogin(true)}>Login</button>
      </p>
    </div>
  );
}

export default Register;