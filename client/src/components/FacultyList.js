import { useEffect, useState } from "react";

function FacultyList() {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [facultyFeedback, setFacultyFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState("All");

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5001/faculties", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5001/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          faculty_id: selectedFaculty.id,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Feedback Submitted ✅");
        setRating("");
        setComment("");
        fetchFeedback(selectedFaculty.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const fetchFeedback = async (facultyId) => {
    try {
      setLoading(true);
      setFacultyFeedback(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/faculties/${facultyId}/feedback`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();
      console.log("Feedback API Response:", data);

      if (response.ok) {
        setFacultyFeedback(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Fetch feedback error:", error);
      alert("Unable to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const matchesSearch =
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDesignation =
      designationFilter === "All" ||
      faculty.designation?.toLowerCase().includes(designationFilter.toLowerCase());

    return matchesSearch && matchesDesignation;
  });

  return (
    <div>
      <h2>Faculty List</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name, designation, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Designations</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
        </select>
      </div>

      <p className="results-count">
        <b>Total Faculties Found:</b> {filteredFaculties.length}
      </p>

      {filteredFaculties.map((faculty) => (
        <div className="faculty-card" key={faculty.id}>
          <h3>{faculty.name}</h3>
          <div className="designation-badge">
            {faculty.designation}
          </div>
          <p><b>Department:</b> {faculty.department}</p>
          <p><b>Email:</b> {faculty.email}</p>
          <p><b>Mobile:</b> {faculty.mobile_no}</p>

          <button
            onClick={() => {
              setSelectedFaculty(faculty);
              setFacultyFeedback(null);
            }}
          >
            Give Feedback
          </button>

          <button
            onClick={() => {
              setSelectedFaculty(faculty);
              fetchFeedback(faculty.id);
            }}
          >
            View Feedback
          </button>

          {selectedFaculty?.id === faculty.id && (
            <div className="feedback-box">
              <h3>Feedback for {selectedFaculty.name}</h3>

              <input
                type="number"
                placeholder="Rating (1-5)"
                value={rating}
                min="1"
                max="5"
                step="1"
                onChange={(e) => {
                  let value = e.target.value;

                  if (value === "") {
                    setRating("");
                    return;
                  }

                  value = Number(value);

                  if (value >= 1 && value <= 5) {
                    setRating(value);
                  }
                }}
              />

              <input
                type="text"
                placeholder="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button onClick={handleSubmit}>Submit Feedback</button>
            </div>
          )}

          {loading && selectedFaculty?.id === faculty.id && (
            <p className="loading-text">Loading feedback...</p>
          )}

          {facultyFeedback && selectedFaculty?.id === faculty.id && (
            <div className="feedback-display">
              <h3>Feedback for {facultyFeedback?.faculty?.name}</h3>
              <p><b>Department:</b> {facultyFeedback?.faculty?.department}</p>
              <p><b>Average Rating:</b> {facultyFeedback?.averageFeedback}</p>
              <p><b>Total Feedback:</b> {facultyFeedback?.totalFeedback}</p>

              {facultyFeedback?.feedback?.length > 0 ? (
                facultyFeedback.feedback.map((item, index) => (
                  <div className="feedback-item" key={index}>
                    <p><b>Rating:</b> {item.rating} ⭐</p>
                    <p><b>Comment:</b> {item.comment}</p>
                  </div>
                ))
              ) : (
                <p>No feedback available yet.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FacultyList;