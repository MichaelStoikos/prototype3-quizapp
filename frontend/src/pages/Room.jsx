import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/socket";

function Room() {
    const { roomCode } = useParams();
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);
    const hasJoinedRoom = useRef(false); // Track if the user has already joined

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`http://localhost:2000/room/${roomCode}/participants`);
                if (!response.ok) {
                    throw new Error("Failed to fetch participants");
                }
                const data = await response.json();
                setParticipants(data.participants);
            } catch (err) {
                setError(err.message);
            }
        };

        // Join the room via socket if not already joined
        const joinRoom = () => {
			if (!hasJoinedRoom.current) {
				const isCreator = name === "Room Creator"; // Assuming 'name' is the creator's name
				if (!isCreator) {
					// Only emit 'joinRoom' if the user is not the creator
					socket.emit("joinRoom", { roomCode, name }, (response) => {
						if (response.error) {
							setError(response.error);
						} else {
							hasJoinedRoom.current = true; // Mark as joined
						}
					});
				}
				// Mark creator as "joined" immediately to avoid redundant joins
				hasJoinedRoom.current = true;
			}
		};
		

        fetchParticipants();
        joinRoom();

        // Listen for participant updates
        socket.on("participantUpdate", (updatedParticipants) => {
            console.log("Received participantUpdate event:", updatedParticipants);
            setParticipants(updatedParticipants);
        });

        return () => {
            socket.off("participantUpdate");
        };
    }, [roomCode]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="room-container">
            <h1>Room: {roomCode}</h1>

            <section className="participants-section">
                <h2>Participants ({participants.length-1})</h2>
                <ul>
				{participants
					.filter((participant) => participant.name && participant.name.trim() !== "")
					.map((participant, index) => (
						<li key={index}>{participant.name}</li>
					))}
                </ul>
            </section>
        </div>
    );
}

export default Room;
