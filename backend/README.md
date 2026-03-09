# IoT Water Tank Monitoring - Backend API

A FastAPI-based backend service for collecting, storing, and serving IoT sensor data for water tank monitoring systems.

## Features

- **Real-time Sensor Data Collection**: Automatically collects distance and temperature readings from ThingSpeak or generates test data
- **Tank Parameter Management**: CRUD operations for tank sensor configurations
- **RESTful API**: Clean API endpoints for frontend integration
- **PostgreSQL Database**: Persistent storage for sensor readings and tank parameters
- **Background Data Collection**: Daemon thread continuously fetches sensor data
- **CORS Support**: Configured for cross-origin requests from frontend applications

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with psycopg2
- **Server**: Uvicorn ASGI server
- **Data Validation**: Pydantic models

## Prerequisites

- Python 3.8+
- PostgreSQL database server
- pip package manager

## Installation

1. **Clone the repository** and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**:
   - Create a database named `iot-test`
   - Update connection settings in `main.py` if needed:
     ```python
     host="localhost",
     database="iot-test",
     user="postgres",
     password="postgres"
     ```

## Configuration

Edit the following variables in [`main.py`](main.py) to customize behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_MODE` | Use generated test data instead of ThingSpeak | `True` |
| `NODE_ID` | Default sensor node identifier | `"NODE_001"` |
| `url` | ThingSpeak API endpoint | ThingSpeak channel URL |

## Running the Server

Start the FastAPI server:

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Sensor Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sensor-data` | Get all sensor readings (latest 100) |
| `GET` | `/sensor-data?node_id={id}` | Get sensor readings for specific node |

**Response Example:**
```json
[
  {
    "id": 1,
    "node_id": "NODE_001",
    "distance": 94.5,
    "temperature": 20.8,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### Tank Parameters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tank-parameters` | Get all tank configurations |
| `POST` | `/tank-parameters` | Create new tank configuration |

**POST Request Body:**
```json
{
  "node_id": "NODE_001",
  "tank_height_cm": 200,
  "tank_length_cm": 100,
  "tank_width_cm": 100,
  "lat": 17.4474,
  "long": 78.3491
}
```

**Response:**
```json
{
  "message": "Tank parameters inserted successfully",
  "id": 1
}
```

## Database Schema

### sensor_data
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| node_id | VARCHAR(50) | Sensor node identifier |
| field1 | FLOAT | Distance reading (cm) |
| field2 | FLOAT | Temperature reading (°C) |
| created_at | TIMESTAMP | Reading timestamp |

### tank_sensorparameters
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| node_id | VARCHAR(50) | Tank node identifier |
| tank_height_cm | FLOAT | Tank height in cm |
| tank_length_cm | FLOAT | Tank length in cm |
| tank_width_cm | FLOAT | Tank width in cm |
| lat | FLOAT | GPS latitude |
| long | FLOAT | GPS longitude |

## API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py           # Main application file with all endpoints
├── requirements.txt  # Python dependencies
├── README.md         # This file
└── api/              # Additional API modules (if any)
```

## Development

### Test Mode

When `TEST_MODE = True`, the sensor collector generates random data around base values:
- Distance: 94.0 cm ± 10 cm
- Temperature: 20.8°C ± 2°C

Data is collected every 20 seconds.

### Switching to Real Data

1. Set `TEST_MODE = False` in [`main.py`](main.py)
2. Configure your ThingSpeak channel URL
3. Ensure ThingSpeak API key is correct

## Integration with Frontend

This backend is designed to work with the React frontend in the `../frontend` directory. The frontend expects:

- API running on `http://127.0.0.1:8000`
- CORS headers enabled (already configured)
- Endpoints as documented above

## License

This project is part of the College Research Affiliate Program.