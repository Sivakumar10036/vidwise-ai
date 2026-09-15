require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const testGemini = async () => {

    try {

        const response = await ai.models.generateContent({

            model: "gemini-3.8-flash",

            contents:
                "Explain Java HashMap in one simple paragraph.",

        });

        console.log("\n==============================");
        console.log("GEMINI RESPONSE");
        console.log("==============================\n");

        console.log(response.text);

        console.log(
            "\nGemini API is working successfully! 🤖🔥"
        );

    } catch (error) {

        console.error(
            "\nGemini API Error:",
            error.message
        );
    }
};

testGemini();