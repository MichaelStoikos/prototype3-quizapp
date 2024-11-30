import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateRoom() {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const createRoom = async () => {
        const response = await fetch("http://localhost:2000/create-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hostName: name }),
        });
        const data = await response.json();
        navigate(`/room/${data.roomCode}`);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Create a Room</h1>
            <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={createRoom}>Create Room</button>
        </div>
    );
}

export default CreateRoom;
