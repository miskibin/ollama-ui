# Ollama Prompt Engineer


![image](https://github.com/user-attachments/assets/b35aa658-6e54-4c98-9f5f-6d98d695d72a)

## Overview

Ollama Prompt Engineer is a sophisticated web-based chat interface that interacts with Ollama, an open-source large language model runner. This application empowers users to engage with AI models, process PDFs, and fine-tune AI interactions through a user-friendly interface.

## Features

### 📊 Dynamic Chat Interface
- Real-time interaction with Ollama AI models
- Markdown rendering of AI responses
- Message editing and regeneration capabilities

![Chat Interface](https://github.com/user-attachments/assets/19af0df8-2be3-42fa-91c5-93dadbab1e9d)

### 📄 PDF Processing
- Upload and parse PDFs to markdown
- Seamless integration of parsed content into the chat

![PDF Parsing](https://github.com/user-attachments/assets/2101fb10-c2b1-4b2f-ac38-9a0f5602819b)

### 🎛️ Advanced AI Settings
- Model selection from available Ollama models
- Customizable AI parameters:
  - Temperature
  - Top P
  - Repeat Penalty
  - Top K
- Streaming responses toggle
- Custom system prompts for specialized interactions

### 🧪 Prompt Testing and Creation
- Dedicated interface for crafting and testing prompts
- Real-time feedback on prompt effectiveness

![Prompt Testing](https://github.com/user-attachments/assets/7b5f3dcb-69cf-4f4d-9e8f-ede1c1e7d23e)

### 🎨 Responsive Design
- Fluid and adaptive UI for various screen sizes
- Resizable components for personalized layout

## Prerequisites

- Node.js (v14 or later) and npm
- Ollama installed and running locally (http://localhost:11434)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/miskibin/ollama-ui
   cd ollama-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure Ollama is running on your local machine.

4. Launch the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Chat Interface
- Choose an AI model from the top-left dropdown
- Type your message and press Enter or click the Send icon
- Use Shift+Enter for multi-line input

### PDF Processing
- Click the file icon in the chat input to upload a PDF
- Parsed content will automatically populate the chat input

### Customizing AI Behavior
- Adjust sliders in the settings panel to modify AI parameters
- Toggle "Stream Responses" for real-time or complete responses
- Enter custom system prompts to guide AI behavior

### Prompt Testing
- Navigate to the Prompt Testing section
- Craft your prompt and observe AI responses
- Iterate and refine for optimal results

## Troubleshooting

- **Model Loading Issues**: Ensure Ollama is running and accessible at http://localhost:11434
- **PDF Parsing Errors**: Check that the PDF contains extractable text (not scanned images)
- **Unresponsive UI**: Clear browser cache and reload, or check console for error messages

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ollama team for the incredible AI model runner
- All contributors and users of this project

---

For more information, visit our [GitHub repository](https://github.com/miskibin/ollama-ui) or reach out to the maintainers.
