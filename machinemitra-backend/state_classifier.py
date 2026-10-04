def classify_drill_state(power_kw: float, rpm: int, vibration: float, temp: float) -> str:
    """
    Evaluates physical state logic for the CNC Industrial Drilling Machine (MM-DRL-001).
    """
    # Machine switched off or disconnected
    if power_kw < 0.2 and rpm == 0:
        return "OFF"
    
    # Motor spinning with no actual drilling engagement
    if power_kw < 1.2 and rpm > 500 and vibration < 1.2:
        return "IDLE"
    
    # Thermal emergency
    if temp >= 85.0:
        return "OVERHEATING"

    # Extreme mechanical chatter or bearing instability
    if vibration > 3.2:
        return "ABNORMAL_VIBRATION"

    # Motor drawing current beyond rated nominal coil envelope
    if power_kw > 7.2:
        return "OVERLOAD"

    # Standard nominal manufacturing cycle
    return "RUNNING_NORMAL"