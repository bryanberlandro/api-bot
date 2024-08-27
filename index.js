const express = require('express');
const cors = require('cors')
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const invisibleTagFeat = require('./features/invisibleTagFeat');
const tagAllFeat = require('./features/tagAllFeat');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json');
const app = express();

app.use(cors(
    {
        origin: ['http://localhost:5173', 'https://api-bot-kappa.vercel.app/']
    }
))

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    })
});

const db = admin.firestore();
const sessionsCollection = db.collection('whatsapp-sessions');

const store = {
    async set(sessionId, data) {
        await sessionsCollection.doc(sessionId).set(data);
    },
    async get(sessionId) {
        const doc = await sessionsCollection.doc(sessionId).get();
        return doc.exists ? doc.data() : null;
    },
    async delete(sessionId) {
        await sessionsCollection.doc(sessionId).delete();
    }
};

const client = new Client({
    authStrategy: new LocalAuth({
        store
    })
});

let qrCode = ''; 

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        qrCode = url;
    })
});

client.on('ready', () => {
    console.log('Bot is ready...');
})

client.on('message', async message => {
    console.log(`Pesan diterima: ${message.body}`);

    // Contoh respon otomatis
    if(message.from.includes('@g.us')){
        const chat = await message.getChat();
        const sender = await message.getContact();
        const participants = await chat.participants;

        const participant = participants.find(p => p.id._serialized === sender.id._serialized);

        if(participant.isAdmin){
            if(message.body.includes(".h")){
                const cleanMessage = message.body.replace(".h", "").trim();
                client.sendMessage(message.from, cleanMessage)
            }
            if (message.body.includes(".all")) {
                invisibleTagFeat(client, message, participants)
            }
            if (message.body.includes(".tagall")) {
                tagAllFeat(client, participants, chat)
            }
        }
    }
});

client.initialize();

app.get('/qr', (req, res) => {
    if(qrCode){
        res.json({
            qrcode: qrCode,
            status: 200,
            message: "Successfully get qr code"
        })
    } else {
        res.status(404).json({message: "QR code not available"});
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})