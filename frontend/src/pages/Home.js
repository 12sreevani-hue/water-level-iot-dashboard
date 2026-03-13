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

        const percentage = Math.min(
          100,
          Math.round(((200 - item.distance) / 200) * 100)
        );

        const time = new Date(item.created_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });

        return {
          time: time,
          value: percentage
        };

      });

      setWaterLevelData(waterData);

    }

  } catch (error) {

    console.error("Error fetching sensor data:", error);

  } finally {

    setLoading(false);

  }
};