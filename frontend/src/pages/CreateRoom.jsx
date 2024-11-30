import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../components/socket";

function CreateRoom() {
	const [hostName, setHostName] = useState("");
	const navigate = useNavigate();

	const createRoom = async () => {
		const response = await fetch("http://localhost:2000/create-room", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ hostName }),
		});
		const data = await response.json();
		const roomCode = data.roomCode;

		// Emit the event to join the room via socket
		socket.emit("joinRoom", { roomCode, name: hostName });
		navigate(`/room/${roomCode}`);
	};

	return (
		<div>
			<h1>Create a Room</h1>
			<input type="text" placeholder="Enter Name" value={hostName} onChange={(e) => setHostName(e.target.value)} />
			<button onClick={createRoom}>Create</button>
		</div>
	);
}

export default CreateRoom;
