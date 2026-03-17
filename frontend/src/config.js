const API_BASE_URL = process.env.REACT_APP_API_URL;

export default {
  API_BASE_URL,
  SENSOR_DATA_URL: `${API_BASE_URL}/sensor-data`,
  TANK_PARAMETERS_URL: `${API_BASE_URL}/tank-parameters`,
};