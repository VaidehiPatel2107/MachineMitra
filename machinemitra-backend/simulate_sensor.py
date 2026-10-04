import time
import random
import requests
from datetime import datetime, timezone

API_URL = "http://127.0.0.1:8000/api/v1/telemetry/ingest"
MACHINE_ID = "MM-DRL-001"

print(f"Starting Edge Sensor Simulator for {MACHINE_ID}...")
print(f"Transmitting JSON telemetry to {API_URL} (Ctrl+C to stop)")

temp = 64.5
vib = 1.75
rpm = 2850
power = 5.20
torque = 18.2

while True:
    try:
        temp = round(temp + random.uniform(-0.3, 0.3), 1)
        vib = round(vib + random.uniform(-0.06, 0.06), 2)
        rpm = int(rpm + random.randint(-15, 15))
        power = round(power + random.uniform(-0.08, 0.08), 2)
        torque = round(torque + random.uniform(-0.15, 0.15), 1)
        sound = round(72.0 + random.uniform(-1.5, 1.5), 1)

        payload = {
            "machineId": MACHINE_ID,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "temperature": temp,
            "vibration": vib,
            "drillSpeedRpm": rpm,
            "powerKw": power,
            "torqueNm": torque,
            "soundDb": sound
        }

        resp = requests.post(API_URL, json=payload, timeout=2)
        if resp.status_code == 201:
            data = resp.json()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Ingested | State: {data.get('operational_state', 'OK')} | {rpm} RPM | {vib} mm/s | {temp}°C")
        else:
            print(f"Warning {resp.status_code}: {resp.text}")

    except Exception as e:
        print(f"Connection error: {e}")

    time.sleep(1.5)
