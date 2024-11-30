import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateRoom() {
    const [name, setName] = useState("");
    const [error, setError] = useState(null); // State for handling errors
    const navigate = useNavigate();

    const createRoom = async () => {
        // Validate the name input
        if (!name || name.trim() === "") {
            setError("Name cannot be empty"); // Set error if input is invalid
            return;
        }

        try {
            const response = await fetch("http://localhost:2000/create-room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hostName: name.trim() }), // Trim whitespace
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to create room"); // Handle server error
                return;
            }

            const data = await response.json();
            navigate(`/room/${data.roomCode}`); // Navigate to the room page
        } catch (err) {
            setError("An error occurred while creating the room"); // Handle unexpected errors
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Create a Room</h1>
            <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setError(null); // Clear error when the user types
                }}
            />
            <button onClick={createRoom}>Create Room</button>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
        </div>
    );
}

export default CreateRoom;
