import datetime
import json


# Load units configuration from a JSON file
def load_units_config(config_path="units.json"):
    try:
        with open(config_path, "r") as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading units configuration: {e}")
        return {}

def transform_data(extracted_data):
    units_config = load_units_config()
    transformed_records = []
    for record in extracted_data:
        properties = record.get("property", {})

        # Extracting and transforming the timestamp
        timestamp = record.get("created_at")
        if timestamp:
            dt = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            date = dt.date().isoformat()  # YYYY-MM-DD format
            time = dt.strftime("%H:%M:%S")  # HH:MM:SS format without milliseconds
        else:
            date = None
            time = None

        transformed_record = {
            "date": date,
            "time": time,
            "timestamp": timestamp,
            "voltage": {
                "V1": properties.get("V1_Voltage"),
                "V2": properties.get("V2_Voltage"),
                "V3": properties.get("V3_Voltage"),
                "unit": units_config.get("voltage", "Volts")  # Load unit from config
            },
            "current": {
                "I1": properties.get("I1_Current"),
                "I2": properties.get("I2_Current"),
                "I3": properties.get("I3_Current"),
                "unit": units_config.get("current", "Ampere")  # Load unit from config
            },
            "power": {
                "KW": {
                    "L1": properties.get("KW_L1"),
                    "L2": properties.get("KW_L2"),
                    "L3": properties.get("KW_L3"),
                    "unit": units_config.get("power", {}).get("KW", "kW")  # Load unit from config
                },
                "Kvar": {
                    "L1": properties.get("Kvar_L1"),
                    "L2": properties.get("Kvar_L2"),
                    "L3": properties.get("Kvar_L3"),
                    "unit": units_config.get("power", {}).get("Kvar", "kVar")  # Load unit from config
                },
                "KVA": {
                    "L1": properties.get("KVA_L1"),
                    "L2": properties.get("KVA_L2"),
                    "L3": properties.get("KVA_L3"),
                    "unit": units_config.get("power", {}).get("KVA", "kVA")  # Load unit from config
                },
                "PF": {
                    "L1": properties.get("PF_L1"),
                    "L2": properties.get("PF_L2"),
                    "L3": properties.get("PF_L3"),  # Corrected to PF_L3
                    "unit": units_config.get("power", {}).get("PF", "%")  # Load unit from config
                },
                "Total": {
                    "Kvar": properties.get("Total_Kvar"),
                    "KVA": properties.get("Total_KVA"),
                    "PF": properties.get("Total_PF"),
                    "KW": (
                        properties.get("KW_L1", 0) +
                        properties.get("KW_L2", 0) +
                        properties.get("KW_L3", 0)
                    )
                }
            },
            "energy": {
                "KwhImport": properties.get("Kwh_Import"),
                "KVAhImport": properties.get("KVAh_import"),
                "unit": units_config.get("energy", "kWh")  # Load unit from config
            },
            "network": {
                "act": properties.get("act"),
                "rssi": properties.get("rssi"),
                "wwanIp": properties.get("wwan_ip"),
                "rsrp": properties.get("rsrp"),
                "rsrq": properties.get("rsrq"),
                "lte": {
                    "rx": properties.get("lte_rx"),
                    "tx": properties.get("lte_tx"),
                    "bytes": properties.get("lte_bytes")
                },
                "Frequency": {
                    "Freq": properties.get("Frequency"),
                    "unit": units_config.get("frequency", "Hz")  # Load unit from config
                }
            }
        }

        transformed_records.append(transformed_record)

    return transformed_records