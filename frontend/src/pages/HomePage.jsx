import { useNavigate } from "react-router-dom";

function HomePage() {
	const navigate = useNavigate();

	return (
		<div>
			<h1>Create Room</h1>
			<button onClick={() => navigate("/create")}>Create Room</button>

			<h1>Join Room</h1>
			<input
				type="text"
				placeholder="Insert Code"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						navigate(`/room/${e.target.value}`);
					}
				}}
			/>
		</div>
	);
}

export default HomePage;
