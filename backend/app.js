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
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        const roomCollection = db.collection("Rooms");
        const participantCollection = db.collection("Participants");

        // Save the room
        const room = { code: roomCode, hostName, createdAt: new Date() };
        await roomCollection.insertOne(room);

        // Add the creator as a participant
        await participantCollection.insertOne({ roomCode, name: hostName, joinedAt: new Date() });

        res.json({ roomCode, message: `${hostName} has created the room` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Join Room
app.post("/join-room", async (req, res) => {
    const { name, roomCode } = req.body;
    try {
        const roomCollection = db.collection("Rooms");
        const room = await roomCollection.findOne({ code: roomCode });

        if (!room) {
            return res.status(404).json({ error: "Invalid room code" });
        }

        const participantCollection = db.collection("Participants");
        await participantCollection.insertOne({ roomCode, name, joinedAt: new Date() });
        res.json({ message: `${name} has joined the room `});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get("/room/:roomCode/participants", async (req, res) => {
    const { roomCode } = req.params;
    try {
        const participantCollection = db.collection("Participants");
        const participants = await participantCollection.find({ roomCode }).toArray();
        res.json({ participants });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", async ({ roomCode, name }, callback) => {
		try {
			const roomCollection = db.collection("Rooms");
			const room = await roomCollection.findOne({ code: roomCode });
	
			if (!room) {
				return callback({ error: "Invalid room code. Room does not exist." });
			}
	
			const participantCollection = db.collection("Participants");
			await participantCollection.insertOne({ roomCode, name, joinedAt: new Date() });
	
			// Fetch the updated participants list
			const participants = await participantCollection.find({ roomCode }).toArray();
	
			// Emit the updated participants list to everyone in the room
			io.to(roomCode).emit("participantUpdate", participants);
	
			// Join the user to the room
			socket.join(roomCode);
	
			// Send confirmation back to the joining client
			callback({ success: true, message: "Successfully joined the room" });
		} catch (error) {
			callback({ error: "An error occurred while joining the room" });
		}
	});
	
	
	
	

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});



server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});