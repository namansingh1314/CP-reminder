# Contest Reminder API Documentation

## Overview
The Contest Reminder API is built using Node.js, Express.js, and Nodemailer to send reminder emails for coding contests (e.g., Leetcode Weekly and Biweekly contests). Users can subscribe to receive email reminders for specific contests and unsubscribe at any time. Contests and user subscriptions are managed using CSV files.

### Features:
- Subscribe to contest reminders.
- Unsubscribe from contest reminders.
- Scheduled email reminders for subscribed users.
  
## Table of Contents
1. [Requirements](#requirements)
2. [Installation](#installation)
3. [API Endpoints](#api-endpoints)
   - [Subscribe to Contest](#subscribe-to-a-contest)
   - [Unsubscribe from Contest](#unsubscribe-from-a-contest)
4. [Scheduled Tasks](#scheduled-tasks)
5. [CSV Structure](#csv-structure)
6. [Environment Variables](#environment-variables)

---

## Requirements
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository-url.git
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and provide your email credentials:
   ```bash
   EMAIL_ADDRESS=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   PORT=5000
   ```

4. Start the server:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:5000`.

---

## API Endpoints

### 1. Subscribe to a Contest

**URL:** `/subscribe`  
**Method:** `POST`  
**Description:** Allows a user to subscribe to contest reminders.

#### Request:
- **Body Parameters:**
  - `email` (string) - The user's email address.
  - `contestName` (string) - The name of the contest (e.g., `leetcode-weekly`, `leetcode-biweekly`).

#### Example Request:
```json
{
  "email": "user@example.com",
  "contestName": "leetcode-weekly"
}
```

#### Response:
- **200 OK**
  - **Description:** Subscription successful.
  - **Response:**
    ```json
    {
      "message": "Subscription successful"
    }
    ```
  
- **400 Bad Request**
  - **Description:** Contest not found or user already subscribed.
  - **Response (contest not found):**
    ```json
    {
      "message": "Contest not found"
    }
    ```
  - **Response (already subscribed):**
    ```json
    {
      "message": "Already subscribed"
    }
    ```

---

### 2. Unsubscribe from a Contest

**URL:** `/unsubscribe`  
**Method:** `GET`  
**Description:** Allows a user to unsubscribe from a specific contest reminder.

#### Request:
- **Query Parameters:**
  - `email` (string) - The user's email address.
  - `contestName` (string) - The name of the contest (e.g., `leetcode-weekly`, `leetcode-biweekly`).

#### Example Request:
```
GET http://localhost:5000/unsubscribe?email=user@example.com&contestName=leetcode-weekly
```

#### Response:
- **200 OK**
  - **Description:** Unsubscribed successfully.
  - **Response:**
    ```json
    {
      "message": "Unsubscribed successfully"
    }
    ```

---

## Scheduled Tasks

The API uses the `node-schedule` package to schedule emails for subscribed users based on the contest schedules. The following cron jobs are set up:

1. **Leetcode Weekly Contest**: Every Sunday at 7:00 PM UTC.
   - Cron: `0 0 19 * * 0`
  
2. **Leetcode Biweekly Contest**: Every Wednesday and Sunday at 4:24 PM UTC.
   - Cron: `0 24 16 * * 0,3`

For each scheduled time, the API will:
- Read the `users.csv` file to find users subscribed to the respective contest.
- Send reminder emails to those users using the configured email service.

---

## CSV Structure

The `users.csv` file is used to store user subscriptions. It contains two columns:

- `email`: The email address of the user.
- `contest`: The name of the contest they are subscribed to.

**Example:**
```csv
email,contest
user1@example.com,leetcode-weekly
user2@example.com,leetcode-biweekly
```

---

## Environment Variables

The API relies on environment variables to configure certain values. Ensure the following variables are set in your `.env` file:

- `EMAIL_ADDRESS`: The email address used to send the reminder emails.
- `EMAIL_PASSWORD`: The password for the email account.
- `PORT`: The port on which the server will run (default: `5000`).

---

## Error Handling

- If the contest name provided in the `/subscribe` request does not match an existing contest, a `400 Bad Request` response is returned.
- If the user is already subscribed to the contest, a `400 Bad Request` response is returned.
- If there's an error sending an email (e.g., wrong email credentials), the error will be logged to the console.

---

## Conclusion

This API provides a simple and efficient way to remind users about upcoming coding contests. With scheduled tasks and email notifications, it helps users stay updated and ensures they don't miss participating in contests.