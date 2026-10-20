# Local AI setup

Routely uses Ollama to run the assistant model on your own computer. Chat requests and the app’s route data stay on this computer; there is no paid model API.

## One-time setup

1. Install Ollama for Windows from https://ollama.com/download.
2. Open PowerShell and download the model by running: ollama pull qwen3.5:4b
   The model download is about 3.4 GB. It needs internet and enough disk space.
3. Start Ollama if it is not already running. The Ollama app normally runs in the background.
4. From the Routely project folder, start the app with: npm run dev
5. Open the local Vite URL shown in the terminal and use the AI panel.

The development server proxies /api to Ollama at 127.0.0.1:11434. This keeps the browser call local and avoids browser CORS configuration.

## Hosting

This connection is for local development on the computer running both Routely and Ollama. A public website cannot use this computer’s local model for visitors. A hosted version needs an Ollama/model server that is reachable by the deployed app, or each user needs a local model setup.
