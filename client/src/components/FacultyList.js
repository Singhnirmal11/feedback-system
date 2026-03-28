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
  const [editingId, setEditingId] = useState(null);

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
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const url = editingId
        ? `http://localhost:5001/feedback/${editingId}`
        : "http://localhost:5001/feedback";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
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
        alert(editingId ? "Updated successfully" : "Feedback submitted");
        setRating("");
        setComment("");
        setEditingId(null);
        fetchFeedback(selectedFaculty.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
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

      if (response.ok) {
        setFacultyFeedback(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/feedback/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Deleted successfully");
        fetchFeedback(selectedFaculty.id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setRating(item.rating);
    setComment(item.comment);
    setEditingId(item.id);
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const matchesSearch =
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDesignation =
      designationFilter === "All" ||
      faculty.designation
        ?.toLowerCase()
        .includes(designationFilter.toLowerCase());

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
          <option value="Associate Professor">
            Associate Professor
          </option>
          <option value="Assistant Professor">
            Assistant Professor
          </option>
        </select>
      </div>

      <p className="results-count">
        <b>Total Faculties Found:</b> {filteredFaculties.length}
      </p>

      <div className="faculty-grid">
        {filteredFaculties.map((faculty) => (
          <div className="faculty-card" key={faculty.id}>
            <h3>{faculty.name}</h3>

            <div className="designation-badge">
              {faculty.designation}
            </div>

            <p>
              <b>Department:</b> {faculty.department}
            </p>
            <p>
              <b>Email:</b> {faculty.email}
            </p>
            <p>
              <b>Mobile:</b> {faculty.mobile_no}
            </p>

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
                  onChange={(e) => setRating(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button onClick={handleSubmit}>
                  {editingId ? "Update Feedback" : "Submit Feedback"}
                </button>
              </div>
            )}

            {loading && selectedFaculty?.id === faculty.id && (
              <p className="loading-text">Loading...</p>
            )}

            {facultyFeedback && selectedFaculty?.id === faculty.id && (
              <div className="feedback-display">
                <h3>{facultyFeedback.faculty.name}</h3>
                <p>
                  <b>Average Rating:</b>{" "}
                  {facultyFeedback.averageFeedback}
                </p>
                <p>
                  <b>Total Feedback:</b>{" "}
                  {facultyFeedback.totalFeedback}
                </p>

                {facultyFeedback.feedback.map((item) => (
                  <div className="feedback-item" key={item.id}>
                    <p>
                      <b>Rating:</b> {item.rating} ⭐
                    </p>
                    <p>
                      <b>Comment:</b> {item.comment}
                    </p>

                    <button onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FacultyList;