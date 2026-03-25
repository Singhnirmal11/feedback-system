import { useEffect, useState } from "react";

function FacultyList() {
  const[selectedFaculty,setSelectedFaculty]= useState(null);
  const[rating,setRating]=useState("");
  const[comment,setComment]=useState("");
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


  const handleSubmit= async () =>{
    try{
      const token=localStorage.getItem("token");

      const response=await fetch("http://localhost:5001/feedback",{
        method: "POST",
        headers:{
          "Content-type": "application/json",
          "Authorization": "Bearer "+ token
        },
        body: JSON.stringify({
          faculty_id: selectedFaculty.id,
          rating: rating,
          comment: comment
        })
      });
      
      const data= await response.json();

      if(response.ok){
        alert("Feedback Submitted..");
      }else{
        alert(data.message);
      }
    } catch(error){
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Faculty List</h2>

      {faculties.map((faculty) => (
        <div key={faculty.id}>
          <p><b>{faculty.name}</b> - {faculty.department}</p>

          <button onClick={() =>setSelectedFaculty(faculty)}>
            Give Feedback
          </button>
        </div>
      ))}

      {selectedFaculty && (
        <div>
          <h3>Feedback for {selectedFaculty.name}</h3>

          <input
          type="number"
          placeholder="rating (1-5)"
          onChange={(e)=> setRating(e.target.value)}
          />

          <br /> <br />

          <input
          type="text"
          placeholder="comment"
          onChange={(e)=> setComment(e.target.value)}
          />

          <br /> <br />

          <button onClick={handleSubmit}> Submit Feedback</button>
        </div>
      )}

    </div>
  );
}

export default FacultyList;