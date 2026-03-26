import { useState } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import FacultyList from "./components/FacultyList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="app-container">
      <h1 className="main-heading">University Faculty Feedback System </h1>

      {!isLoggedIn ? (
        showLogin ? (
          <div className="card">
            <Login setIsLoggedIn={setIsLoggedIn} setShowLogin={setShowLogin} />
          </div>
        ) : (
          <div className="card">
            <Register setShowLogin={setShowLogin} />
          </div>
        )
      ) : (
        <div className="card">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
            }}
          >
            Logout
          </button>

          <FacultyList />
        </div>
      )}
    </div>
  );
}

export default App;