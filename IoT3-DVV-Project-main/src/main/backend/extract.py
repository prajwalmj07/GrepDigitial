from fastapi import HTTPException
import httpx
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

API_URL = os.getenv("API_URL")

if not API_URL:
    raise Exception("API_URL is not set in the .env file")

# Make the API call to get both device info and paginated data
async def make_api_request(device_serial_number: str, page_token: dict = None):
    body = {
        "deviceSerialNumber": device_serial_number,
        "type": "modon",
        "data_per_page": 1000
    }

    if page_token:
        body["page_token"] = page_token

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(API_URL, json=body)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in API request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Fetch device data with pagination, start and end dates
async def fetch_data(device_serial_number: str, start_date: str, end_date: str, max_pages: int = 50, stable_count_threshold: int = 3):
    page_token = None
    all_data = []
    date_found = False
    stable_count = 0
    last_record_count = 0
    device_info = {}

    try:
        # Parse the start and end dates
        start_date_obj = datetime.fromisoformat(start_date).date()
        end_date_obj = datetime.fromisoformat(end_date).date()

        # Iterate over the pages
        for _ in range(max_pages):
            response_data = await make_api_request(device_serial_number, page_token)

            if not response_data or "response" not in response_data:
                print(f"Invalid response data: {response_data}")
                raise HTTPException(status_code=500, detail="Invalid response from API")

            payload = response_data.get("response", {}).get("Payload", [])

            # Extract device info once, from the first page
            if not device_info and payload:
                first_record = payload[0]

                created_at = first_record.get("created_at")
                if created_at:
                    formatted_created_at = datetime.fromisoformat(created_at).strftime("%Y/%m/%d %H:%M:%S")
                else:
                    formatted_created_at = "N/A"

                device_info = {
                    "lastUpdate": formatted_created_at,
                    "DVer": "Version 1.0",
                    "PVer": "Version 1.0",
                    "deviceID": first_record.get("serialNumber"),
                    "deviceCategory": "Energy Meter",
                    "sourceSitename": "Energy Site",
                    "modelName": first_record.get("property", {}).get("modelname"),
                    "deviceName": first_record.get("property", {}).get("devicename"),
                    "version": first_record.get("property", {}).get("version"),
                    "macAddress": first_record.get("property", {}).get("mac address"),
                    "serialNumber": first_record.get("property", {}).get("serial number"),
                    "IPADD": first_record.get("property", {}).get("IPADD"),
                    "status": first_record.get("property", {}).get("status"),
                    "latestRecord" : {
                        "Date_Time" : formatted_created_at,
                        "created_at": first_record.get("created_at"),
                        "V1_Voltage": first_record.get("property", {}).get("V1_Voltage"),
                        "V2_Voltage": first_record.get("property", {}).get("V2_Voltage"),
                        "V3_Voltage": first_record.get("property", {}).get("V3_Voltage"),
                        "I1_Current": first_record.get("property", {}).get("I1_Current"),
                        "I2_Current": first_record.get("property", {}).get("I2_Current"),
                        "I3_Current": first_record.get("property", {}).get("I3_Current"),
                        "KW_L1": first_record.get("property", {}).get("KW_L1"),
                        "KW_L2": first_record.get("property", {}).get("KW_L2"),
                        "KW_L3": first_record.get("property", {}).get("KW_L3"),
                        "Kvar_L1": first_record.get("property", {}).get("Kvar_L1"),
                        "Kvar_L2": first_record.get("property", {}).get("Kvar_L2"),
                        "Kvar_L3": first_record.get("property", {}).get("Kvar_L3"),
                        "KVA_L1": first_record.get("property", {}).get("KVA_L1"),
                        "KVA_L2": first_record.get("property", {}).get("KVA_L2"),
                        "KVA_L3": first_record.get("property", {}).get("KVA_L3"),
                        "PF_L1": first_record.get("property", {}).get("PF_L1"),
                        "PF_L2": first_record.get("property", {}).get("PF_L2"),
                        "PF_L3": first_record.get("property", {}).get("PF_L3"),
                        "Frequency": first_record.get("property", {}).get("Frequency"),
                        "Total_Kvar": first_record.get("property", {}).get("Total_Kvar"),
                        "Total_KVA": first_record.get("property", {}).get("Total_KVA"),
                        "Total_PF": first_record.get("property", {}).get("Total_PF"),
                        "Total_KW": first_record.get("property", {}).get("Total_KW"),
                        "Kwh_Import": first_record.get("property", {}).get("Kwh_Import"),
                        "KVAh_import": first_record.get("property", {}).get("KVAh_import"),
                        "act": first_record.get("property", {}).get("act"),
                        "rssi": first_record.get("property", {}).get("rssi"),
                        "wwan_ip": first_record.get("property", {}).get("wwan_ip"),
                        "rsrp": first_record.get("property", {}).get("rsrp"),
                        "rsrq": first_record.get("property", {}).get("rsrq"),
                        "lte_rx": first_record.get("property", {}).get("lte_rx"),
                        "lte_tx": first_record.get("property", {}).get("lte_tx"),
                        "lte_bytes": first_record.get("property", {}).get("lte_bytes"),
                    }
                }


            if len(payload) == 0:
                print("No data found in payload.")
                break

            # Iterate through the payload, excluding the last element for pagination token
            for record in payload[:-1]:
                created_at = record.get("created_at")
                if created_at:
                    if created_at.endswith('+00:0'):
                        created_at = created_at[:-1] + '00'
                    try:
                        record_date = datetime.fromisoformat(created_at).date()
                        if start_date_obj <= record_date <= end_date_obj:
                            all_data.append(record)
                            date_found = True
                        elif record_date < start_date_obj:
                            stable_count = stable_count_threshold
                            break
                    except ValueError as ve:
                        print(f"ValueError parsing date for record: {record}, error: {ve}")
                        continue

            # Check for stable record count to exit loop
            if date_found:
                current_record_count = len(all_data)
                if current_record_count == last_record_count:
                    stable_count += 1
                else:
                    stable_count = 0

                if stable_count >= stable_count_threshold:
                    break

                last_record_count = current_record_count

            # Get the next page_token from the last record for pagination
            page_token = payload[-1].get("page_token", None) if payload else None
            if not page_token:
                break

        return {"device_info": device_info, "data": all_data}

    except Exception as e:
        print(f"Internal Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
