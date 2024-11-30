import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../components/socket";

function Room() {
    const { roomCode } = useParams();
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch initial participants
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

        // Join the room via socket
        const joinRoom = () => {
            socket.emit("joinRoom", { roomCode, name: "Room Creator" }, (response) => {
                if (response.error) {
                    setError(response.error);
                }
            });
        };

        fetchParticipants();
        joinRoom();

        // Listen for participant updates
        socket.on("participantUpdate", (updatedParticipants) => {
            console.log("Received participantUpdate event:", updatedParticipants);
            setParticipants(updatedParticipants);
        });

        // Cleanup listeners on unmount
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
                <h2>Participants ({participants.length})</h2>
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>{participant.name}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default Room;