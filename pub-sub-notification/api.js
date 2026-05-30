const express = require('express');
const redis = require('ioredis');

const app = express();
app.use(express.json());

// Initialize the Redis Publisher client
const publisher = new redis('redis://localhost:6379');

const CHANNEL_NAME = 'notifications';

// When someone hits this POST endpoint, we broadcast the data
app.post('/notifications', async (req, res) => {
    const { title, message } = req.body;

    const alertPayload = {
        title: title || "System Alert",
        message: message || "No details provided",
        timestamp: new Date().toISOString()
    };

    console.log(`📢 Broadcasting alert via Pub/Sub...`);

    // Publish the payload to the channel
    const activeSubscribers = await publisher.publish(
        CHANNEL_NAME, 
        JSON.stringify(alertPayload)
    );

    // Respond back to the API client immediately
    return res.json({
        success: true,
        message: "Alert broadcasted successfully",
        listenersReached: activeSubscribers
    });
});

app.listen(3000, () => {
    console.log("API Server running on port 3000");
});