const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 5000;

app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));
app.use(morgan('dev')); // Логи в консоль


const USERS_FILE = path.join(__dirname, 'users.json');

let users = [];
try {
    if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE));
        console.log(`Loaded ${users.length} users from file`);
    }
} catch (err) {
    console.error('Error loading users:', err);
}

// Сохранение пользователей в файл
const saveUsers = () => {
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) console.error('Error saving users:', err);
    });
};

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

app.use(session({
    secret: 'SDFF-DAFX-KSDV-AFOM',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));


const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        console.log('Unauthorized access attempt to protected route');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Registration attempt for user: ${username}`);

        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (users.some(u => u.username === username)) {
            console.log(`Username ${username} already exists`);
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers();

        console.log(`User ${username} registered successfully`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for user: ${username}`);

        const user = users.find(u => u.username === username);
        if (!user) {
            console.log(`User ${username} not found`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log(`Invalid password for user ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.user = {
            id: user.id,
            username: user.username
        };

        console.log(`User ${username} logged in successfully`);
        res.json({
            message: 'Login successful',
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/profile', requireAuth, (req, res) => {
    if (req.session.user) {
        res.json({
            isAuthenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.post('/api/logout', (req, res) => {
    if (req.session.user) {
        console.log(`User ${req.session.user.username} logging out`);
    }
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

// Функция для кэширования
const getCachedData = () => {
    const cacheFile = path.join(__dirname, 'cache', 'data.json');
    const cacheDuration = 60 * 1000;

    try {
        if (fs.existsSync(cacheFile)) {
            const cacheData = JSON.parse(fs.readFileSync(cacheFile));
            if (Date.now() - cacheData.timestamp < cacheDuration) {
                console.log('Serving data from cache');
                return cacheData.data;
            }
        }

        const newData = {
            timestamp: Date.now(),
            data: {
                message: 'This is cached data',
                randomNumber: Math.floor(Math.random() * 1000),
                time: new Date().toISOString()
            }
        };

        fs.writeFileSync(cacheFile, JSON.stringify(newData));
        console.log('Generated new cached data');
        return newData.data;
    } catch (error) {
        console.error('Cache error:', error);
        return { error: 'Failed to process data' };
    }
};

app.get('/api/data', (req, res) => {
    console.log('Data request received');
    const data = getCachedData();
    res.json(data);
});

// Обработка 404
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not found' });
});

// Обработка ошибок
app.use((err, req, res) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Users file: ${USERS_FILE}`);
    console.log(`Cache directory: ${path.join(__dirname, 'cache')}`);
});