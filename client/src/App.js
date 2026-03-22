import {useState} from "react";
import Login from "./components/Login";
import FacultyList from "./components/FacultyList";

function App() {
  const[isLoggedIn,setIsLoggedIn] =useState(false);

  return(
    <div>
      <h1>Feedback System</h1>

    {!isLoggedIn ?(
      <Login setIsLoggedIn ={setIsLoggedIn} />
    ) : (
      <FacultyList />
    )}
    </div>
  );
}

export default App;