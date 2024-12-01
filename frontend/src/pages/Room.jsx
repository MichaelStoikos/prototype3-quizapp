import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../components/socket";

function Room() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);
    const [hostName, setHostName] = useState("");
    const hasJoinedRoom = useRef(false);
    const [currentUser, setCurrentUser] = useState("");

    useEffect(() => {
        // Retrieve current user and host name from local storage or context
        const storedHostName = localStorage.getItem(`room_${roomCode}_host`);
        const storedCurrentUser = localStorage.getItem(`room_${roomCode}_user`);
        
        if (storedHostName) setHostName(storedHostName);
        if (storedCurrentUser) setCurrentUser(storedCurrentUser);

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

        const joinRoom = () => {
            if (!hasJoinedRoom.current) {
                socket.emit("joinRoom", { roomCode, name: storedCurrentUser }, (response) => {
                    if (response.error) {
                        setError(response.error);
                    } else {
                        hasJoinedRoom.current = true;
                    }
                });
            }
        };

        // Listen for game start event
        socket.on("gameStarted", () => {
            navigate(`/quiz/${roomCode}`);
        });

        fetchParticipants();
        joinRoom();

        socket.on("participantUpdate", (updatedParticipants) => {
            setParticipants(updatedParticipants);
        });

        return () => {
            socket.off("participantUpdate");
            socket.off("gameStarted");
        };
    }, [roomCode, navigate]);

    const handleStartGame = () => {
        socket.emit("startGame", { roomCode, hostName }, (response) => {
            if (response.error) {
                setError(response.error);
            }
        });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="room-container">
            <h1>Room: {roomCode}</h1>

            <section className="participants-section">
                <h2>Participants ({participants.length})</h2>
                <ul>
                    {participants
                        .filter((participant) => participant.name && participant.name.trim() !== "")
                        .map((participant, index) => (
                            <li key={index}>{participant.name}</li>
                        ))}
                </ul>
            </section>

            {/* Start Game button visible only to the host */}
            {currentUser === hostName && (
                <button 
                    onClick={handleStartGame}
                    className="start-game-btn"
                >
                    Start Game
                </button>
            )}
        </div>
    );
}

export default Room;