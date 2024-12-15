import json


def load_scaling_factors(filename: str):
    with open(filename, 'r') as file:
        return json.load(file)


# Define functions for each operation
def divide(value, factor):
    return value / factor if factor != 0 else 0


def multiply(value, factor):
    return value * factor


def add(value, factor):
    return value + factor


# Mapping of operations to functions
operations = {
    "division": divide,
    "multiplication": multiply,
    "addition": add,

}


def scale_values(device_serial: str, properties: dict, scaling_factors: dict):
    scaled_properties = {}

    for key, value in properties.items():
        # Check if there is a scaling factor for this device and property
        device_scaling = scaling_factors.get(device_serial, {}).get(key)

        if device_scaling:
            scaling_factor = device_scaling.get("value", 1)
            operation_name = device_scaling.get("operation")

            # Get the operation function and apply it, or use the original value if operation not found
            operation_func = operations.get(operation_name, lambda v, f: v)
            scaled_properties[key] = operation_func(value, scaling_factor)
        else:
            scaled_properties[key] = value

    return scaled_properties
