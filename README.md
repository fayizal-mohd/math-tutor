# MathQuest-V2

MathQuest-V2 is an interactive math learning application for students in Years 5-10 of the British curriculum. It uses AI to generate curriculum-aligned math problems and provides a gamified experience with stars, XP, and badges to keep students engaged.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (which includes npm)

## Installation

1.  Clone the repository to your local machine.
2.  Navigate to the project directory:
    ```bash
    cd mathquest-v2
    ```
3.  Install the required dependencies using npm:
    ```bash
    npm install
    ```

## Configuration

This application uses the Google Gemini API to generate math questions. You will need to obtain an API key from the [Google AI Studio](https://aistudio.google.com/).

Once you have your key, set it as an environment variable named `GEMINI_API_KEY`.

**On macOS/Linux:**
```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

**On Windows (Command Prompt):**
```bash
set GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

**On Windows (PowerShell):**
```bash
$env:GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

## Starting the Service

Once you have installed the dependencies and configured your API key, you can start the application server with the following command:

```bash
npm start
```

The server will start, and you can access the application by navigating to `http://localhost:3000` in your web browser.
