require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage (temporary solution)
const users = new Map();
const userStats = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Auth routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (users.has(username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users.set(username, hashedPassword);
        userStats.set(username, { level: 1, xp: 0, achievements: [] });
        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = users.get(username);
        if (!hashedPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.session.user = username;
        const stats = userStats.get(username);
        res.json({ message: 'Login successful', stats });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Stats routes
app.get('/api/stats', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const stats = userStats.get(req.session.user);
    res.json(stats);
});

app.post('/api/update-stats', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const { xp } = req.body;
    const stats = userStats.get(req.session.user);
    stats.xp += xp;
    
    // Level up logic
    const xpNeeded = stats.level * 1000;
    if (stats.xp >= xpNeeded) {
        stats.level += 1;
        stats.xp -= xpNeeded;
    }
    
    userStats.set(req.session.user, stats);
    res.json(stats);
});

// Exercise endpoint
app.post('/api/exercise', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const { exercise, reps, xp } = req.body;
    const stats = userStats.get(req.session.user);
    
    // Update XP
    stats.xp += xp;
    
    // Level up logic
    const xpNeeded = stats.level * 1000;
    if (stats.xp >= xpNeeded) {
        stats.level += 1;
        stats.xp -= xpNeeded;
    }

    // Add exercise to history if not exists
    if (!stats.exerciseHistory) {
        stats.exerciseHistory = [];
    }
    stats.exerciseHistory.push({
        exercise,
        reps,
        xp,
        timestamp: new Date()
    });

    // Update user stats
    userStats.set(req.session.user, stats);
    
    res.json(stats);
});

// Add some sample users for testing
function addSampleUsers() {
    const sampleUsers = [
        { username: 'FitChampion', level: 5, xp: 2500 },
        { username: 'WorkoutWarrior', level: 4, xp: 1800 },
        { username: 'GymMaster', level: 3, xp: 1500 },
        { username: 'FitnessFreak', level: 3, xp: 1200 },
        { username: 'HealthHero', level: 2, xp: 800 }
    ];

    sampleUsers.forEach(user => {
        if (!users.has(user.username)) {
            users.set(user.username, 'samplepass');
            userStats.set(user.username, {
                level: user.level,
                xp: user.xp,
                achievements: []
            });
        }
    });
}

// Add sample users when server starts
addSampleUsers();

// Leaderboard route
app.get('/api/leaderboard', (req, res) => {
    const leaderboardData = Array.from(userStats.entries()).map(([username, stats]) => ({
        username,
        level: stats.level,
        xp: stats.xp
    }));

    // Sort by level first, then by XP
    leaderboardData.sort((a, b) => {
        if (b.level !== a.level) {
            return b.level - a.level;
        }
        return b.xp - a.xp;
    });

    res.json(leaderboardData);
});

// Profile endpoint
app.get('/api/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const stats = userStats.get(req.session.user);
    if (!stats) {
        return res.status(404).json({ message: 'User stats not found' });
    }

    res.json(stats);
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Fitness Quest server running on port ${port}`);
});
