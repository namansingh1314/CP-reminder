// index.js

const express = require('express');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Contests array
const contests = [
    { name: 'leetcode-weekly', cron: '0 0 19 * * 0' },
    { name: 'leetcode-biweekly', cron: '0 24 16 * * 0,3' },
];

// Helper: Read CSV file
const readCSV = (filePath) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

// Helper: Write to CSV file
const writeToCSV = (filePath, data) => {
    const csvFields = ['email', 'contest'];
    const csvData = parse(data, { fields: csvFields });
    fs.writeFileSync(filePath, csvData);
};

// Initialize the users.csv file if it doesn't exist
if (!fs.existsSync('./users.csv')) {
    fs.writeFileSync('./users.csv', 'email,contest\n');
}

// Set up nodemailer email transporter
const transporter = nodemailer.createTransport({
    service: 'outlook', // Use your email service provider here
    auth: {
        user: process.env.EMAIL_ADDRESS, // Replace with your Gmail or email address
        pass: process.env.EMAIL_PASSWORD, // Replace with your email password
    },
});

// Function to send an email
const sendEmail = (email, contestName) => {
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS, // Replace with your email
        to: email,
        subject: `Reminder for ${contestName}`,
        text: `This is a reminder for the ${contestName}. Don't forget to participate!\nIf you want to unsubscribe, click here: http://localhost:5000/unsubscribe?email=${email}&contestName=${contestName}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// Schedule emails for each contest
const scheduleEmails = () => {
    contests.forEach((contest) => {
        schedule.scheduleJob(contest.cron, async () => {
            console.log('Scheduled job for ', contest.name);
            const users = await readCSV('./users.csv');
            users
                .filter((user) => user.contest === contest.name)
                .forEach((user) => sendEmail(user.email, contest.name));
        });
    });
};

// Call the function to schedule emails
scheduleEmails();

// Route to subscribe to a contest
app.post('/subscribe', async (req, res) => {
    const { email, contestName } = req.body;

    // Check if the contest exists
    const contest = contests.find((c) => c.name === contestName);
    if (!contest) {
        return res.status(400).json({ message: 'Contest not found' });
    }

    // Read the current subscriptions from CSV
    const users = await readCSV('./users.csv');

    // Check if the user has already subscribed
    const alreadySubscribed = users.some(
        (user) => user.email === email && user.contest === contestName
    );
    if (alreadySubscribed) {
        return res.status(400).json({ message: 'Already subscribed' });
    }

    // Add the new subscription to the users list
    users.push({ email, contest: contestName });
    writeToCSV('./users.csv', users);

    return res.status(200).json({ message: 'Subscription successful' });
});

// Route to unsubscribe from a contest
app.get('/unsubscribe', async (req, res) => {
    const { email, contestName } = req.query;

    // Read the current subscriptions from CSV
    const users = await readCSV('./users.csv');

    // Filter out the user to unsubscribe
    const newUsers = users.filter(
        (user) => user.email !== email || user.contest !== contestName
    );
    writeToCSV('./users.csv', newUsers);

    return res.status(200).json({ message: 'Unsubscribed successfully' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
