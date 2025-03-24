# 📅 WhatsApp Calendar Assistant

This project connects Google calendar service with WhatsApp, allowing users to add, edit, delete, and view calendar events via chat.

---

## 🚀 Setup Instructions

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and **create a new project**.
2. Search for **"API and Services"** and **create a service account**.
3. Once the service account is created, generate a **key** (in JSON format) and **save it securely**.
4. Search for **"Google Calendar API"**, click on it, and then click **"Enable"**.
5. Go to [Google Calendar](https://calendar.google.com/calendar), open your calendar settings, and **share your calendar** with the **service account's email address**. Make sure to give it **Editor** access.

### 2. OpenAI Setup

1. Visit [OpenAI Platform](https://platform.openai.com/).
2. **Create a new project** and **generate an API key**.
3. Save the key securely — it will be used as an environment variable.

---


## 📦 Environment Variables

Create a `.env` file in your project root with the following structure:

```env
CALENDAR_ID=<yourPersonalEmail@gmail.com>
GOOGLE_CLIENT_EMAIL=<yourGoogleServiceAccount@gmail.com>
GOOGLE_PRIVATE_KEY=<yourGooglePrivateKey>
OPENAI_API_KEY=<yourOpenAPIKey>
```
---
## ▶️ Running the Project

1. Set the required environment variables
2. In the terminal, run: (I am using pnpm but you can also use npm)
```
# Install dependencies 
pnpm install
# Start the project
pnpm start
```
