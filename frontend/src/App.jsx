import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Create from "./pages/CreateRoom";
import "./styles/App.css";

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/create" element={<Create />} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
