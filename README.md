# MathQuest-V2

MathQuest-V2 is an interactive and adaptive math learning application designed for students in Years 5-10 of the British curriculum. It uses AI to generate curriculum-aligned math problems and provides a gamified experience to keep students engaged and motivated.

## Features

*   **Adaptive Learning:** Questions are tailored to the student's year group, covering the official UK mathematics curriculum for Years 5 through 10.
*   **AI-Powered Question Generation:** Utilizes the Google Gemini API to generate an endless supply of unique, context-aware word problems.
*   **Gamified Rewards System:** Students earn stars, XP, and badges for correct answers, streaks, and milestones, encouraging consistent practice.
*   **Persistent Student Progress:** All progress is saved to a database, allowing students to log out and resume their learning at any time without losing their achievements.
*   **Secure User Authentication:** Features a secure login and registration system with password hashing to protect user accounts.
*   **Parent Dashboard:** Parents can create their own accounts to manage application settings, such as configuring the necessary API key.

## How to Set Up

### 1. Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (which includes npm)

### 2. Installation

Clone the repository and install the required dependencies.
```bash
# Clone the repository
git clone <repository_url>
# Navigate into the project directory
cd mathquest-v2
# Install dependencies
npm install
```

### 3. Running the Application

Start the web server with the following command:
```bash
npm start
```
The server will start, and you can access the application by navigating to **`http://localhost:3000`** in your web browser.

### 4. Application Configuration

The application requires a Google Gemini API key to function.

1.  **Obtain an API Key:** Get your key from the [Google AI Studio](https://aistudio.google.com/).
2.  **Register a Parent Account:** Open the application in your browser, and register a new account with the role set to "Parent".
3.  **Save the API Key:** Log in with your new parent account and click the "Parent Controls" button. Paste your Gemini API key into the input field and click "Save".

The application is now fully configured and ready for student use.
