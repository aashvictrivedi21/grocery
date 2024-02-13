const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const admin = require('firebase-admin');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));
const firebaseConfig = {
    apiKey: "AIzaSyBtS3QLSpW134WJ5noPjboZVOngg45oUok",
    authDomain: "groceryapp-3f109.firebaseapp.com",
    projectId: "groceryapp-3f109",
    storageBucket: "groceryapp-3f109.appspot.com",
    messagingSenderId: "786809648991",
    appId: "1:786809648991:web:c16d3a84db4a0db3e8e8ea",
    measurementId: "G-RG8FXJGVCN"
};

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
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route for serving signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/signup.html'));
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
