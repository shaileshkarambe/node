import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    })
);

const FIREBASE_API_URL = "https://fcm.googleapis.com/v1/projects/local-service-providers-app/messages:send";
const SERVICE_ACCOUNT_KEY_PATH = "D:\Project\notify_server\local-service-providers-app-firebase-adminsdk-ibvz1-39e9448fdc.json";

app.use(function(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
});

app.post("/send", async function(req, res) {
    try {
        const { fcmToken, title, body } = req.body;

        const message = {
            message: {
                token: fcmToken, // Use the received FCM token dynamically
                notification: {
                    title: title,
                    body: body,
                },
            },
        };

        const response = await axios.post(FIREBASE_API_URL, message, {
            headers: {
                "Authorization": `Bearer $(await getAccessToken())`,
                "Content-Type": "application/json",
            },
        });

        res.status(200).json({
            message: "Successfully sent message",
            token: fcmToken,
            title: title,
            body: body,
        });
        console.log("Successfully sent message:", response.data);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(400).send(error.message);
    }
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

async function getAccessToken() {
    try {
        const { GoogleAuth } = require("google-auth-library");
        const auth = new GoogleAuth({
            keyFile: SERVICE_ACCOUNT_KEY_PATH,
            scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
        });
        const client = await auth.getClient();
        const accessTokenResponse = await client.getAccessToken();
        return accessTokenResponse.token;
    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
}