const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./killing-blow-firebase-adminsdk-v4ebu-2405cfc4a3.json'); // Update the path to your service account key JSON file

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://killing-blow-default-rtdb.firebaseio.com" // Update this to your Firebase database URL
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', async (token) => {
        try {
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            socket.user = decodedToken;
            console.log(`User ${decodedToken.uid} connected`);
        } catch (error) {
            console.error('Authentication error:', error);
            socket.disconnect();
        }
    });

    socket.on('sendMessage', async (data) => {
        if (!socket.user) {
            return;
        }
        const { message } = data;
        const chatMessage = {
            username: socket.user.email,
            message,
            timestamp: new Date().toISOString()
        };
        io.emit('receiveMessage', chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

exports.api = functions.https.onRequest((req, res) => {
    if (!req.path) {
        req.url = `/${req.url}`; // Prepend '/' to keep query params if any
    }
    return app(req, res);
});