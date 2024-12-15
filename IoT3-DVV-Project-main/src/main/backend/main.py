from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extract import fetch_data
from export import export_data
from transform import transform_data
from calibration import load_scaling_factors, scale_values
import logging
import json

# Initialize FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress 'httpx' logging at INFO level (set it to WARNING)
httpx_logger = logging.getLogger("httpx")
httpx_logger.setLevel(logging.WARNING)

# Load scaling factors from calibration JSON
scaling_factors = load_scaling_factors('calibration.json')


# Load threshold values from thresholds.json
def load_threshold_values(filename: str):
    """Load threshold values from a JSON file."""
    with open(filename, 'r') as file:
        return json.load(file)


THRESHOLD_VALUES = load_threshold_values('thresholds.json')


# Response model for fetch-and-transform endpoint
class ResponseModel(BaseModel):
    status: str
    device_info: dict
    threshold_values: dict
    mapped_data: list


@app.get("/fetch-and-transform", response_model=ResponseModel)
async def fetch_and_transform(device_serial_number: str, start_date: str, end_date: str, max_pages: int = 50):
    """
    Fetches and transforms device data within the specified date range.
    """
    try:
        logger.info(f"Fetching data from the backend for the dates {start_date} to {end_date}")

        # Fetch data, which includes device_info and data records
        extracted_data = await fetch_data(device_serial_number, start_date, end_date, max_pages)
        device_info = extracted_data.get('device_info')

        scaled_latest_record = scale_values(device_serial_number, device_info["latestRecord"], scaling_factors)
        device_info["latestRecord"] = scaled_latest_record

        data_records = extracted_data.get('data', [])

        # Scale the values for each record
        for record in data_records:
            properties = record.get("property", {})
            scaled_properties = scale_values(device_serial_number, properties, scaling_factors)
            record['property'] = scaled_properties

        # Transform the scaled data
        transformed_data = transform_data(data_records)

        # Return the response with device_info, threshold values, and mapped data
        return {
            "status": "success",
            "device_info": device_info,
            "threshold_values": THRESHOLD_VALUES,
            "mapped_data": transformed_data
        }

    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/export")
async def export(
        device_serial_number: str,
        start_date: str,
        end_date: str,
        max_pages: int = 50,
        file_format: str = Query("csv", enum=["csv", "json"])
):
    """
    Exports calibrated device data in CSV or JSON format within the specified date range.
    """
    try:
        logger.info(
            f"Starting export for device {device_serial_number} from {start_date} to {end_date} as {file_format}")

        # Fetch the data
        extracted_data = await fetch_data(device_serial_number, start_date, end_date, max_pages)
        data_records = extracted_data.get('data', [])

        # Calibrate and export data
        return await export_data(data_records, file_format, scaling_factors, device_serial_number)

    except Exception as e:
        logger.error(f"Error during export: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")