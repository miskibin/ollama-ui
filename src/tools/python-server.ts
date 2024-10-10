declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

let pyodide: any = null;

async function initializePyodide() {
  if (!pyodide) {
    // Load Pyodide script
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Initialize Pyodide
    pyodide = await window.loadPyodide();
  }
}

export async function executePythonCode(code: string): Promise<string> {
  try {
    await initializePyodide();
    if (!pyodide) {
      throw new Error("Pyodide not initialized");
    }
    const result = await pyodide.runPythonAsync(code);
    return result.toString();
  } catch (error) {
    console.error("Error executing Python code:", error);
    return "An error occurred while executing the Python code.";
  }
}
