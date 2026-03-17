import os
from dotenv import load_dotenv
import requests
import psycopg2
import time
import random
import threading
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# DATABASE CONNECTION
# ==============================
def get_connection():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", "5432"),
        database=os.environ.get("DB_NAME", "iot-test"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", "postgres"),
        sslmode=os.environ.get("DB_SSLMODE", "prefer")
    )

# ==============================
# CREATE TABLES
# ==============================
def create_tables():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        node_id VARCHAR(50),
        field1 FLOAT,
        field2 FLOAT,
        created_at TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tank_sensorparameters (
        id SERIAL PRIMARY KEY,
        node_id VARCHAR(50),
        tank_height_cm FLOAT,
        tank_length_cm FLOAT,
        tank_width_cm FLOAT,
        lat FLOAT,
        long FLOAT
    )
    """)

    conn.commit()
    cur.close()
    conn.close()

# ==============================
# CONFIG
# ==============================
TEST_MODE = True
NODE_ID = "NODE_001"

# ==============================
# TEST DATA
# ==============================
def generate_test_data():
    return {
        "distance": round(94 + random.uniform(-10, 10), 1),
        "temperature": round(20 + random.uniform(-2, 2), 1),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# ==============================
# SENSOR COLLECTOR
# ==============================
def sensor_collector():
    while True:
        try:
            data = generate_test_data()

            conn = get_connection()
            cur = conn.cursor()

            cur.execute("""
            INSERT INTO sensor_data (node_id, field1, field2, created_at)
            VALUES (%s,%s,%s,%s)
            """, (NODE_ID, data["distance"], data["temperature"], data["created_at"]))

            conn.commit()
            cur.close()
            conn.close()

            print("Inserted:", data)

        except Exception as e:
            print("Error:", e)

        time.sleep(20)

# ==============================
# MODEL
# ==============================
class TankParameters(BaseModel):
    node_id: str
    tank_height_cm: float
    tank_length_cm: float
    tank_width_cm: float
    lat: float
    long: float

# ==============================
# APIs
# ==============================

@app.post("/tank-parameters")
def create_tank(data: TankParameters):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO tank_sensorparameters
    (node_id, tank_height_cm, tank_length_cm, tank_width_cm, lat, long)
    VALUES (%s,%s,%s,%s,%s,%s)
    RETURNING id
    """, (
        data.node_id,
        data.tank_height_cm,
        data.tank_length_cm,
        data.tank_width_cm,
        data.lat,
        data.long
    ))

    new_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Inserted", "id": new_id}


@app.get("/tank-parameters")
def get_tanks():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM tank_sensorparameters")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows


# ✅ SINGLE SENSOR API (FINAL)
@app.get("/sensor-data")
def get_sensor_data(node_id: str = None):

    conn = get_connection()
    cur = conn.cursor()

    if node_id:
        cur.execute("""
        SELECT id,node_id,field1,field2,created_at
        FROM sensor_data
        WHERE node_id=%s
        ORDER BY created_at DESC
        """, (node_id,))
    else:
        cur.execute("""
        SELECT id,node_id,field1,field2,created_at
        FROM sensor_data
        ORDER BY created_at DESC
        """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "node_id": row[1],
            "distance": row[2],
            "temperature": row[3],
            "created_at": row[4]
        })

    return result


@app.post("/predict")
def predict(distance: float, temperature: float):
    return {
        "distance": distance,
        "temperature": temperature,
        "predicted_water_level": 200 - distance
    }

# ==============================
# STARTUP
# ==============================
@app.on_event("startup")
def start():
    create_tables()
    threading.Thread(target=sensor_collector, daemon=True).start()

# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    