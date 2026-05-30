const express = require('express')
const Redis = require('ioredis')

const app = express();
app.use(express.json());

// Connect to your local Redis instance
const redis = new Redis('redis://localhost:6379');

// The single Redis key that will store our sorted set
const LEADERBOARD_KEY = 'game:leaderboard';


/**
 * 1. POST /leaderboard/submit
 * Updates or adds a player's score
 */
app.post('/leaderboard/submit', async (req, res)=>{
    const { username, score } = req.body;

    if (!username || score === undefined) {
        return res.status(400).json({ error: "Please provide username and score." });
    }

    try{
        // ZADD takes the key, the score (number), and the member (string)
        // If the player exists, it updates their score; if not, it creates them.
        await redis.zadd(LEADERBOARD_KEY, score, username);
        return res.status(200).json({ message: "Score submitted successfully!" });
    }catch(error){
        console.error(error);
        return res.status(500).json({ error: "Failed to submit score" });
    }

});

/**
 * 2. GET /leaderboard/top
 * Returns the top 10 players
 */
app.get('/leaderboard', async(req,res)=>{
    try{
        // ZREVRANGE fetches elements sorted from high to low.
        // Parameters: key, start_index (0), stop_index (9 means top 10), 'WITHSCORES'
        const rawData = await redis.zrevrange(LEADERBOARD_KEY, 0, 9, 'WITHSCORES');
        // Redis returns data as a flat array: ['playerA', '5000', 'playerB', '4200']
        // Let's format it nicely into an array of cleaner objects
        
        const leaderboard = [];

        for (let i = 0; i < rawData.length; i += 2) {
            leaderboard.push({
                rank: i / 2 + 1,
                username: rawData[i],
                score: parseInt(rawData[i + 1])
            });
        }
        
        return res.json(leaderboard);

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
})



/**
 * 3. GET /leaderboard/player/:username
 * Fetches the global ranking and score of a single player
 */
app.get('/leaderboard/player/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // ZREVRANK returns the 0-indexed rank sorted from high to low (0 is #1)
        const rank = await redis.zrevrank(LEADERBOARD_KEY, username);
        // ZSCORE gets the current score of the member
        const score = await redis.zscore(LEADERBOARD_KEY, username);

        if (rank === null || score === null) {
            return res.status(404).json({ error: "Player not found on the leaderboard." });
        }

        return res.json({
            username,
            rank: rank + 1, // Convert 0-index to human-readable rank (e.g., Rank 1)
            score: parseInt(score, 10)
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


app.listen(3000, () => {
    console.log("🎮 Leaderboard API running on http://localhost:3000");
});