import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/socket";

function Room() {
	const { roomCode } = useParams();
	const [participants, setParticipants] = useState([]);

	useEffect(() => {
		const fetchParticipants = async () => {
			const response = await fetch(`http://localhost:2000/room/${roomCode}/participants`);
			const data = await response.json();
			setParticipants(data.participants);
		};

		fetchParticipants();

		// Listen for participant updates via Socket.IO
		socket.on("participantUpdate", fetchParticipants);

		return () => {
			socket.off("participantUpdate");
		};
	}, [roomCode]);

	return (
		<div>
			<h1>Room Code: {roomCode}</h1>
			<h2>Participants</h2>
			<ul>
				{participants.map((p, index) => (
					<li key={index}>{p.name}</li>
				))}
			</ul>
		</div>
	);
}

export default Room;
