// Importing Next.js's NextResponse to handle HTTP responses and Node.js modules for file system operations
import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // Asynchronous file system methods
import path from 'path'; // Utility for handling file and directory paths

/**
 * Handles POST requests to add a new meter to the `energyMeters` array in `energyMetersData.js`.
 * Expects the request body to contain `id` and `name` of the meter.
 *
 * @param {Request} request - The HTTP POST request object.
 * @returns {Response} - A JSON response indicating success or failure.
 */
export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { id, name } = await request.json();

    // Validate the incoming data
    if (!id || !name) {
      return NextResponse.json(
        { message: 'ID and name are required' },
        { status: 400 } // Bad Request status
      );
    }

    // Define the file path for the `energyMetersData.js` file
    const filePath = path.join(process.cwd(), 'lib/energyMetersData.js');

    // Read the content of the file
    let content = await fs.readFile(filePath, 'utf8');

    // Use a regular expression to match the current `energyMeters` array in the file
    const currentArrayMatch = content.match(/export const energyMeters = (\[[\s\S]*?\]);/);

    // If the array isn't found, return an error response
    if (!currentArrayMatch) {
      return NextResponse.json(
        { message: 'Could not parse file content' },
        { status: 500 } // Internal Server Error status
      );
    }

    // Evaluate the matched array string into a JavaScript array
    const currentArray = eval(currentArrayMatch[1]); // Using eval here can be risky if input is untrusted

    // Add the new meter to the array
    currentArray.push({ id, name });

    // Generate the new file content with the updated `energyMeters` array
    const newContent = `export const energyMeters = ${JSON.stringify(currentArray, null, 2)};`;

    // Write the updated content back to the file
    await fs.writeFile(filePath, newContent);

    // Return a success response
    return NextResponse.json({ message: 'Meter added successfully' });
  } catch (error) {
    // Log any error that occurs for debugging
    console.error('Error adding meter:', error);

    // Return an error response
    return NextResponse.json(
      { message: 'Error adding meter' },
      { status: 500 } // Internal Server Error status
    );
  }
}
