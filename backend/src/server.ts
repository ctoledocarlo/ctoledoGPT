import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { information } from "./information";
import OpenAI from "openai";

// import { usePollinationsText } from '@pollinations/react';

dotenv.config();

const openai = new OpenAI();

const app = express();
const PORT = process.env.PORT ?? 5000;

// Replace the single messages array with a Map to store multiple message histories
const messageHistories = new Map<string, OpenAI.Chat.Completions.ChatCompletionMessageParam[]>();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend is running...");
});

app.get("/ping", (req, res) => {
    res.status(200).send("Server is alive!");
    console.log("Server is alive!");
});

app.post("/askGPT", async (req, res) => {
    const { interaction, sessionId } = req.body; 

    // Initialize or get existing message history for this session
    if (!messageHistories.has(sessionId)) {
        messageHistories.set(sessionId, [{ role: "system", content: information }]);
    }
    
    const messages = messageHistories.get(sessionId)!;
    messages.push(interaction);

    try {
        const completion = await openai.chat.completions.create({
            store: true,
            model: "gpt-4o-mini",
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const messageContent = completion.choices[0];
        console.log(completion.choices);
        res.json({ message: messageContent });
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: "Failed to process request" });
    }
});

// Add a new endpoint to clear messages for a specific session
app.post("/clearMessages", (req, res) => {
    const { sessionId } = req.body;
    messageHistories.delete(sessionId);
    res.status(200).json({ message: "Messages cleared successfully" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
