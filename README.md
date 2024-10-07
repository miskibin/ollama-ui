# Ollama Chat Interface

![image](https://github.com/user-attachments/assets/89439c2e-0a80-45d9-80a8-53f3ae303276)
![image](https://github.com/user-attachments/assets/b1ddb3d9-96b1-4ff1-a2a5-d5d4e049b1d2)


## Overview

This project is a web-based chat interface that interacts with Ollama, an open-source large language model runner. It allows users to chat with AI models, upload and parse PDFs (to markdown) , and customize various settings for the AI interactions.

## Prerequisites

- Node.js and npm installed on your system
- Ollama installed and running on your local machine (http://localhost:11434)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/miskibin/ollama-ui
   cd https://github.com/miskibin/ollama-ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Ensure Ollama is running on your local machine.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Features

- Chat interface for interacting with Ollama AI models
- PDF parsing and uploading functionality
- Customizable AI settings including:
  - Model selection
  - Custom prompts/templates
  - Temperature and Top P adjustments
  - Streaming responses
- Markdown rendering of AI responses
- Responsive and resizable UI

## Usage

### Chat Interface

- Select an AI model from the dropdown menu
- Type your message in the input box and press Enter or click Send
- Use Shift+Enter for new lines in your input

### PDF Parsing

- Click the "Upload PDF" button to select a PDF file
- The parsed content will be inserted into the chat input

### Custom Settings

- Adjust the temperature and Top P sliders to fine-tune AI responses
- Toggle streaming responses on/off
- Enter custom templates for specialized AI interactions

## Important Notes

- This application requires Ollama to be running locally on port 11434
- Ensure you have the necessary models downloaded in Ollama before selecting them in the interface
- The PDF parsing feature supports basic text extraction and markdown conversion

## Troubleshooting

- If you encounter issues with model loading or responses, ensure Ollama is running and accessible
- For PDF parsing issues, check the console for error messages and ensure the PDF is text-based and not scanned images

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

