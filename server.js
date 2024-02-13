const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const admin = require('firebase-admin');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

const serviceAccount = require("C:/Users/bhavya/Desktop/grocery/key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const db = admin.firestore();

app.use((req, res, next) => {
    console.log('Request Payload:', req.body);
    next();
});

app.post('/signup', (req, res) => {
    emailOrMobile = req.body.emailOrMobile;
    password = req.body.password;
    try {
        db.collection('users').add({
            emailOrMobile,
            password
        });
        res.json({ message: 'Signup successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Signup failed' });
    }
});

app.post('/login', async (req, res) => {
    const { emailOrMobile, password } = req.body;
    try {
        const userSnapshot = await db.collection('users').where('emailOrMobile', '==', emailOrMobile).limit(1).get();
        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'User not found' });
        }
        const user = userSnapshot.docs[0].data();
        const storedPassword = user.password;
        if (password !== storedPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home.html'));
});

// Route for serving signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/signup.html'));
});


// Serve the products page if the user is authenticated
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/products.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
