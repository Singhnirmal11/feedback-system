import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import FacultyList from "./components/FacultyList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      <h1>Feedback System..</h1>

      {!isLoggedIn ? (
        showLogin ? (
          <Login setIsLoggedIn={setIsLoggedIn} setShowLogin={setShowLogin} />
        ) : (
          <Register setShowLogin={setShowLogin} />
        )
      ) : (
        <FacultyList />
      )}
    </div>
  );
}

export default App;