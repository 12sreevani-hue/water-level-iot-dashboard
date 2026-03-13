import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import config from "../config";

const Home = () => {

  const [waterLevel, setWaterLevel] = useState(0);
  const [temperature, setTemperature] = useState(0);

  const [waterLevelData, setWaterLevelData] = useState([]);
  c
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState("");

  // Node mapping
  const getActualTankId = (nodeId) => {
    const mapping = {
      "Node 1": "NODE_001",
      "Node 2": "NODE_002",
      "NODE_001": "NODE_001"
    };
    return mapping[nodeId] || nodeId;
  };

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {

      setLoading(true);

      const response = await axios.get(config.SENSOR_DATA_URL, {
        headers: { accept: "application/json" }
      });

      const allSensorData = response.data || [];

      const actualNodeId = getActualTankId(selectedNode);

      const sensorData = allSensorData.filter(
        (item) => item.node_id === actualNodeId
      );

      if (sensorData.length > 0) {

        const latest = sensorData[0];

        const waterLevelPercentage = Math.min(
          100,
          Math.round(((200 - latest.distance) / 200) * 100)
        );

        setWaterLevel(waterLevelPercentage);
        setTemperature(Math.round(latest.temperature * 10) / 10);

        const reversedData = [...sensorData].reverse();

        const waterData = reversedData.map(item => {

          const time = new Date(item.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          });

          const percentage = Math.min(
            100,
            Math.round(((200 - item.distance) / 200) * 100)
          );

          return {
            time: time,
            value: percentage
          };
        });

        const tempData = reversedData.map(item => {

          const time = new Date(item.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          });

          return {
            time: time,
            value: Math.round(item.temperature * 10) / 10
          };

        });

        setWaterLevelData(waterData);
        setTemperatureData(tempData);

      }

    } catch (error) {

      console.error("Error fetching sensor data:", error);

    } finally {

      setLoading(false);

    }
  };

  // Fetch nodes
  const fetchNodes = async () => {

    try {

      const response = await axios.get(config.TANK_PARAMETERS_URL, {
        headers: { accept: "application/json" }
      });

      const nodesData = response.data || [];

      const transformedNodes = nodesData.map(node => ({
        id: node.node_id,
        name: node.node_id
      }));

      setNodes(transformedNodes);

      if (transformedNodes.length > 0 && !selectedNode) {
        setSelectedNode(transformedNodes[0].id);
      }

    } catch (error) {

      console.error("Error fetching nodes:", error);

    }
  };

  const handleNodeChange = (event) => {
    const nodeId = event.target.value;
    setSelectedNode(nodeId);
  };

  // Initial load
  // eslint-disable-next-line
  useEffect(() => {

    fetchNodes();
    fetchSensorData();

    const interval = setInterval(() => {
      fetchSensorData();
    }, 30000);

    return () => clearInterval(interval);
    

  }, []);

  // eslint-disable-next-line
  useEffect(() => {

    if (selectedNode) {
      fetchSensorData();
    }

  }, [selectedNode]);

  return (

    <div className="home-page">

      <h2 className="page-title">Dashboard Overview</h2>

      <div className="node-selector">

        <label>Tank:</label>

        <select
          value={selectedNode}
          onChange={handleNodeChange}
        >

          <option value="">Select Tank</option>

          {nodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.id}
            </option>
          ))}

        </select>

      </div>

      <div className="cards-container">

        <div className="card">
          <h3>Water Level</h3>
          <p>{loading ? "--" : waterLevel}%</p>
        </div>

        <div className="card">
          <h3>Temperature</h3>
          <p>{loading ? "--" : temperature} °C</p>
        </div>

      </div>

      <div className="graphs-container">

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={waterLevelData}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2196F3"
              strokeWidth="3"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default Home;
  