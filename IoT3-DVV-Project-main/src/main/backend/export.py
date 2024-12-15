from fastapi.responses import StreamingResponse
import pandas as pd
import io
import json
import datetime
from calibration import scale_values


async def export_data(data_records, file_format: str, scaling_factors: dict, device_serial: str):
    # Prepare export data
    export_data = []
    serial_number = device_serial
    for record in data_records:
        timestamp = record.get("created_at")
        if timestamp:
            dt = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            date = dt.date().isoformat()  # YYYY-MM-DD format
            time = dt.strftime("%H:%M:%S")  # HH:MM:SS format without milliseconds
        else:
            date = None
            time = None

        properties = record.get("property", {})
        # Apply scaling to properties
        scaled_properties = scale_values(device_serial, properties, scaling_factors)


        row = {
            "date": date,
            "time": time,
            "V1": scaled_properties.get("V1_Voltage"),
            "V2": scaled_properties.get("V2_Voltage"),
            "V3": scaled_properties.get("V3_Voltage"),
            "I1": scaled_properties.get("I1_Current"),
            "I2": scaled_properties.get("I2_Current"),
            "I3": scaled_properties.get("I3_Current"),
            "KW_L1": scaled_properties.get("KW_L1"),
            "KW_L2": scaled_properties.get("KW_L2"),
            "KW_L3": scaled_properties.get("KW_L3"),
            "KVA_L1": scaled_properties.get("KVA_L1"),
            "KVA_L2": scaled_properties.get("KVA_L2"),
            "KVA_L3": scaled_properties.get("KVA_L3"),
            "PF_L1": scaled_properties.get("PF_L1"),
            "PF_L2": scaled_properties.get("PF_L2"),
            "PF_L3": scaled_properties.get("PF_L3"),
            "KWh_import": scaled_properties.get("KWh_import"),
            "KVAh_import": scaled_properties.get("KVAh_import"),
            "Frequency": scaled_properties.get("Frequency"),
        }
        export_data.append(row)

    # Set default filename if serial_number is None
    filename = f"{serial_number or 'exported_data'}.{file_format}"

    if file_format == "csv":
        # Convert to CSV
        df = pd.DataFrame(export_data)
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/csv"
            }
        )

    elif file_format == "json":
        # Convert to JSON
        json_output = json.dumps(export_data, indent=4)
        return StreamingResponse(
            io.BytesIO(json_output.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/json"
            }
        )
