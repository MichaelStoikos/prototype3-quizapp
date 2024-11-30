const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const config = require("./config/config.json");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 2000;
const url = config.final_url;
const dbName = "Quiz";
const roomsCollection = "Rooms";
const participantsCollection = "Participants";

app.use(cors());
app.use(express.json());

let db;
const client = new MongoClient(url);

client
	.connect()
	.then(() => {
		db = client.db(dbName);
		console.log("MongoDB connected");
	})
	.catch((err) => {
		console.error("MongoDB connection error:", err.message);
		process.exit(1);
	});

// Create Room
app.post("/create-room", async (req, res) => {
	const { hostName } = req.body;
	const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random room code
	try {
		const collection = db.collection(roomsCollection);
		const room = { code: roomCode, hostName, createdAt: new Date() };
		await collection.insertOne(room);
		res.json({ message: "Room created", roomCode });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Join Room
app.post("/join-room", async (req, res) => {
	const { name, roomCode } = req.body;
	try {
		const roomCollection = db.collection(roomsCollection);
		const room = await roomCollection.findOne({ code: roomCode });
		if (!room) return res.status(404).json({ error: "Room not found" });

		const participantCollection = db.collection(participantsCollection);
		await participantCollection.insertOne({ roomCode, name, joinedAt: new Date() });
		res.json({ message: "Joined room successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Real-time updates with Socket.IO
io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	// Join a specific room
	socket.on("joinRoom", ({ roomCode, name }) => {
		socket.join(roomCode);
		console.log(`${name} joined room: ${roomCode}`);

		// Notify all clients in the room about the new participant
		io.to(roomCode).emit("participantUpdate", { roomCode });
	});

	// Handle disconnect
	socket.on("disconnect", () => {
		console.log("A user disconnected:", socket.id);
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
