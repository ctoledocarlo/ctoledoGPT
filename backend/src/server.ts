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

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: "system", content: information }]

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend is running...");
});

app.get("/ping", (req, res) => {
    res.status(200).send("Server is alive!");
    console.log("Server is alive!");
});

app.get("/ask/:prompt", async (req, res) => {
    const { prompt } = req.params; 

    try {
        const response = await axios.post("https://text.pollinations.ai/", {
            messages: [ { role: 'user', content: prompt },
                        { role: 'system', content: information}
            ],
            model: 'openai-large', 
            private: true,    
            seed: 42
        });     
        res.json(response.data); 
    }
    catch (error){
        console.log("Error: ", error);
    }
});

app.post("/askGPT", async (req, res) => {
    const { interaction } = req.body; 

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
            console.log(completion.choices)
            res.json({ message: messageContent });
    }
    catch (error){
        console.log("Error: ", error);
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
