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

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend is running...");
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

app.get("/askGPT/:prompt", async (req, res) => {
    const { prompt } = req.params; 

    try {
        const completion = await openai.chat.completions.create({
            store: true,
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: information }, 
                       { role: "user", content: prompt }]
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
