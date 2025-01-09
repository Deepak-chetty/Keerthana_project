const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize GoogleGenerativeAI with API key
const genAI = new GoogleGenerativeAI({
    apiKey: process.env.API_KEY, // Ensure API key is set in .env
});

app.listen(8584, () => {
    console.log("Server is running on port 8584");
});

// Route to handle chatbot UI rendering
app.get("/chatbot", (req, res) => {
    res.render("./chatbot.ejs");
});

// Route to handle chat messages
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).send({ reply: "Invalid input!" });
    }

    try {
        // Get the model from GoogleGenerativeAI
        const model = await genAI.getGenerativeModel({
            model: "models/text-bison",  // Use the correct model name
        });

        // Log the model object to inspect further methods
        console.log("Model Object: ", model);

        // Create the prompt for the chatbot
        const prompt = `You are a smart assistant that helps users by fetching relevant knowledge articles. Here is the user's query: "${userMessage}". Please provide relevant advice or article.`;

        // Attempt to call an appropriate function for content generation
        const result = await model.create({
            prompt: prompt,
        });

        // Send back the result
        res.send({ reply: result.text || "I'm sorry, I couldn't generate a response." });
    } catch (error) {
        console.error("Error generating response:", error.message);
        res.status(500).send({ reply: `Error: ${error.message}` });
    }
});