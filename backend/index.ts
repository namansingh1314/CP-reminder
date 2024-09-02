import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import schedule from 'node-schedule';
import twilio from 'twilio';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { parse } from 'csv-parse';
import { createObjectCsvWriter } from 'csv-writer';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const SECRET_KEY = 'your_jwt_secret_key';

type Contest = {
    name: string;
    days: number[];
    time: string;
};

const contests: Contest[] = [
    { name: "LeetCode Biweekly Contest", days: [3, 6], time: '19:00' },
    { name: "LeetCode Weekly Contest", days: [6], time: '19:00' }
];

type User = {
    name: string;
    email: string;
    phone: string;
    password: string;
    contests: string[];
};

// CSV file path
const csvFilePath = './users.csv';

// Function to read users from CSV
const readUsersFromCSV = (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        const users: User[] = [];
        fs.createReadStream(csvFilePath)
            .pipe(parse({ columns: true }))
            .on('data', (row:any) => users.push(row))
            .on('end', () => resolve(users))
            .on('error', (err:any) => reject(err));
    });
};

// Function to write users to CSV
const writeUserToCSV = (user: User) => {
    const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'phone', title: 'Phone' },
            { id: 'password', title: 'Password' },
            { id: 'contests', title: 'Contests' }
        ],
        append: true,
    });
    return csvWriter.writeRecords([user]);
};

// Function to update users in CSV
const updateUsersInCSV = (users: User[]) => {
    const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'phone', title: 'Phone' },
            { id: 'password', title: 'Password' },
            { id: 'contests', title: 'Contests' }
        ]
    });
    return csvWriter.writeRecords(users);
};

// Middleware to authenticate the user
const authenticate = (req:any, res:any, next:any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Function to make a call
function makeCall(user: User, contest: Contest) {
    client.calls
        .create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            to: user.phone,
            from: process.env.TWILIO_PHONE_NUMBER!
        })
        .then(call => console.log(`Call placed to ${user.name} for ${contest.name}. Call SID: ${call.sid}`))
        .catch(err => console.error(`Failed to place call to ${user.name}: ${err.message}`));
}

// API to register a user
app.post('/register', async (req, res) => {
    const { name, email, phone, password, contests } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
        name,
        email,
        phone,
        password: hashedPassword,
        contests
    };

    const users = await readUsersFromCSV();

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    writeUserToCSV(user)
        .then(() => res.status(201).json({ message: 'User registered successfully' }))
        .catch((err:any) => res.status(500).json({ error: err.message }));
});

// API to sign in a user
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    const users = await readUsersFromCSV();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Sign in successful', token });
});

// API to fetch contests selected by the authenticated user
app.get('/contests', authenticate, async (req:any, res:any) => {
    const users = await readUsersFromCSV();
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ contests: user.contests });
});

// API to edit contests selected by the authenticated user
app.put('/contests', authenticate, async (req:any, res:any) => {
    const { contests } = req.body;

    const users = await readUsersFromCSV();
    const userIndex = users.findIndex(u => u.email === req.user.email);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].contests = contests;
    await updateUsersInCSV(users);

    return res.status(200).json({ message: 'Contests updated successfully' });
});

// Schedule calls for each contest
contests.forEach(contest => {
    contest.days.forEach(day => {
        const [hours, minutes] = contest.time.split(':').map(Number);
        const callHour = (hours - 2 + 24) % 24;

        schedule.scheduleJob({ hour: callHour, minute: minutes, dayOfWeek: day }, async function () {
            console.log(`Scheduling calls for ${contest.name}`);
            const users = await readUsersFromCSV();

            users.forEach(user => {
                if (user.contests.includes(contest.name)) {
                    makeCall(user, contest);
                }
            });
        });
    });
});

app.get('/', (req, res) => {
    return res.json({ message: 'Hello World' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server started at Port: ${process.env.PORT}`);
});
