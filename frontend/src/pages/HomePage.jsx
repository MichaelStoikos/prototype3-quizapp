import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../components/socket"; 

function HomePage() {
    const navigate = useNavigate(); 
    const [roomCode, setRoomCode] = useState(""); 
    const [name, setName] = useState(""); 
    const [error, setError] = useState(""); 

    const handleJoinRoom = () => {
        if (!roomCode || !name) {
            setError("Please enter both your name and the room code.");
            return;
        }

        
        socket.emit("joinRoom", { roomCode, name }, (response) => {
            if (response.error) {
                setError(response.error); 
            } else {
                setError(""); 
                navigate(`/room/${roomCode}`);
            }
        });
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to the Quiz App</h1>

            <div style={{ marginTop: "20px" }}>
                <h2>Create a Room</h2>
                <button onClick={() => navigate("/create")}>Create Room</button>
            </div>

            <div style={{ marginTop: "30px" }}>
                <h2>Join a Room</h2>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginBottom: "10px", display: "block", width: "300px", padding: "10px" }}
                />
                <input
                    type="text"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    style={{ marginBottom: "10px", display: "block", width: "300px", padding: "10px" }}
                />
                <button onClick={handleJoinRoom} style={{ padding: "10px 20px", fontSize: "16px" }}>
                    Join Room
                </button>
                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            </div>
        </div>
    );
}

export default HomePage;
