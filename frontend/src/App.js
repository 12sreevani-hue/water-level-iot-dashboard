import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NodeCreation from "./pages/NodeCreation";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/node-creation" element={<NodeCreation />} />
      </Routes>
    </Router>
  );
}

export default App;
