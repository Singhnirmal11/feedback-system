import { useEffect, useState } from "react";

function FacultyList() {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5001/faculties", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      const data = await response.json();
      setFaculties(data);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Faculty List</h2>

      {faculties.map((faculty) => (
        <div key={faculty.id}>
          <p><b>{faculty.name}</b> - {faculty.department}</p>
        </div>
      ))}
    </div>
  );
}

export default FacultyList;