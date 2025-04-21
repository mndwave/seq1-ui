# SEQ1 Cursor Integration

This document outlines how to integrate with the SEQ1 device using its API.

## API Endpoints

The SEQ1 API is accessible via the following endpoint:

\`\`\`
https://www.seq1.net/api/seq1
\`\`\`

All API requests should be made to this base URL.

## Authentication

No authentication is currently required.

## API Usage

The API supports both GET and POST requests. GET requests are typically used to retrieve data, while POST requests are used to send commands or data to the SEQ1 device.

### GET Requests

To retrieve data, send a GET request to the base URL with the `endpoint` parameter specifying the desired data.

For example, to get a list of all connected devices:

\`\`\`
GET https://www.seq1.net/api/seq1?endpoint=devices
\`\`\`

### POST Requests

To send commands or data to the SEQ1 device, send a POST request to the base URL with a JSON payload containing the `action` and any necessary parameters.

For example, to send a MIDI message to a specific device:

\`\`\`
POST https://www.seq1.net/api/seq1
Content-Type: application/json

{
  "action": "sendMidiMessage",
  "message": {
    "deviceId": "device123",
    "data": [144, 60, 127]
  }
}
\`\`\`

## Examples

Here are some examples of how to use the SEQ1 API in different programming languages.

### JavaScript

\`\`\`javascript
// Get all devices
async function getDevices() {
  const response = await fetch('https://www.seq1.net/api/seq1?endpoint=devices');
  const data = await response.json();
  return data;
}

// Send a MIDI message
async function sendMidiMessage(deviceId, midiData) {
  const response = await fetch('https://www.seq1.net/api/seq1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'sendMidiMessage',
      message: {
        deviceId,
        data: midiData,
      },
    }),
  });
  const data = await response.json();
  return data;
}

// Ask SEQ1 AI
async function askSeq1(prompt) {
  const response = await fetch('https://www.seq1.net/api/seq1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'askSeq1',
      prompt,
    }),
  });
  const data = await response.json();
  return data;
}
\`\`\`

### Python

\`\`\`python
import requests

# Base URL for the SEQ1 API
BASE_URL = 'https://www.seq1.net/api/seq1'

# Get all devices
def get_devices():
    response = requests.get(f'{BASE_URL}?endpoint=devices')
    return response.json()

# Send a MIDI message
def send_midi_message(device_id, midi_data):
    response = requests.post(
        BASE_URL,
        json={
            'action': 'sendMidiMessage',
            'message': {
                'deviceId': device_id,
                'data': midi_data,
            },
        },
    )
    return response.json()

# Ask SEQ1 AI
def ask_seq1(prompt):
    response = requests.post(
        BASE_URL,
        json={
            'action': 'askSeq1',
            'prompt': prompt,
        },
    )
    return response.json()
\`\`\`
