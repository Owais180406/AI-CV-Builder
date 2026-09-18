// ======================================================
// AI CV BUILDER - BACKEND SERVER
// Node.js + Express + OpenAI
// ======================================================

// ======================================================
// 1. IMPORT PACKAGES
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");


// ======================================================
// 2. LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();


// ======================================================
// 3. CREATE EXPRESS APP
// ======================================================

const app = express();

const PORT = process.env.PORT || 5000;


// ======================================================
// 4. CHECK API KEY
// ======================================================

if (!process.env.OPENAI_API_KEY) {
    console.error("");
    console.error("======================================");
    console.error("❌ OPENAI_API_KEY IS MISSING");
    console.error("======================================");
    console.error("");
    console.error("Please add your OpenAI API key inside .env");
    console.error("");

    process.exit(1);
}


// ======================================================
// 5. CREATE OPENAI CLIENT
// ======================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ======================================================
// 6. MIDDLEWARE
// ======================================================

// Allow frontend requests
app.use(cors());

// Allow JSON data
app.use(
    express.json({
        limit: "2mb"
    })
);


// ======================================================
// 7. HOME / SERVER TEST ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "AI CV Builder Backend is running 🚀"
    });

});


// ======================================================
// 8. AI HELPER FUNCTION
// ======================================================

async function askAI(prompt) {

    try {

        const response = await openai.responses.create({

            model: "gpt-5.6-luna",

            instructions:
                "You are a professional CV and resume writing assistant. " +
                "Always keep information truthful. " +
                "Never invent experience, education, certifications, achievements, " +
                "skills, numbers or responsibilities.",

            input: prompt

        });

        return response.output_text;

    } catch (error) {

        console.error("");
        console.error("======================================");
        console.error("❌ OPENAI API ERROR");
        console.error("======================================");
        console.error(error);
        console.error("");

        throw error;
    }
}


// ======================================================
// 9. GENERATE CV SUMMARY
// ======================================================

app.post("/api/generate-summary", async (req, res) => {

    try {

        const {
            name,
            jobTitle,
            skills,
            experience,
            education
        } = req.body;


        const prompt = `
Create a professional ATS-friendly CV summary.

Candidate Name:
${name || "Not provided"}

Job Title:
${jobTitle || "Not provided"}

Skills:
${skills || "Not provided"}

Experience:
${experience || "Not provided"}

Education:
${education || "Not provided"}


Requirements:

- Write 3 to 5 professional sentences.
- Make it suitable for a modern CV.
- Make it ATS-friendly.
- Highlight relevant skills.
- Keep information truthful.
- Do not invent experience.
- Do not invent achievements.
- Do not invent qualifications.
- Do not invent certifications.
- Do not use a heading.
- Return ONLY the summary.
`;


        const summary = await askAI(prompt);


        res.json({

            success: true,

            summary: summary.trim()

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to generate CV summary."

        });

    }

});


// ======================================================
// 10. SUGGEST SKILLS
// ======================================================

app.post("/api/suggest-skills", async (req, res) => {

    try {

        const {
            jobTitle,
            existingSkills
        } = req.body;


        const prompt = `
Suggest professional skills for this CV.

Job Title:
${jobTitle || "Not provided"}

Existing Skills:
${existingSkills || "None"}


Requirements:

- Suggest 8 to 12 relevant professional skills.
- Do not repeat existing skills.
- Skills must be realistic for the job.
- Do not invent certifications.
- Do not invent experience.
- Return ONLY valid JSON.
- The JSON must be an array of strings.
- Do not use markdown.
- Do not add explanations.

Example:

[
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "Responsive Design"
]
`;


        const result = await askAI(prompt);


        // Remove markdown code fences if AI adds them
        const cleanedResult = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();


        let skills;


        try {

            skills = JSON.parse(cleanedResult);

        } catch (parseError) {

            console.error(
                "❌ AI returned invalid JSON:"
            );

            console.error(cleanedResult);

            throw new Error(
                "AI returned invalid skills format."
            );
        }


        // Make sure result is an array
        if (!Array.isArray(skills)) {

            throw new Error(
                "AI skills response is not an array."
            );

        }


        res.json({

            success: true,

            skills: skills

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to generate skills."

        });

    }

});


// ======================================================
// 11. IMPROVE WORK EXPERIENCE
// ======================================================

app.post("/api/improve-experience", async (req, res) => {

    try {

        const {
            jobTitle,
            company,
            description
        } = req.body;


        const prompt = `
Improve this work experience for a professional CV.

Job Title:
${jobTitle || "Not provided"}

Company:
${company || "Not provided"}

Original Description:
${description || "Not provided"}


Requirements:

- Make it professional.
- Make it ATS-friendly.
- Use strong professional language.
- Keep the candidate's original facts.
- Do not invent achievements.
- Do not invent numbers.
- Do not invent responsibilities.
- Create 3 to 5 concise bullet points.
- Return ONLY the bullet points.
`;


        const improvedExperience =
            await askAI(prompt);


        res.json({

            success: true,

            experience:
                improvedExperience.trim()

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to improve experience."

        });

    }

});


// ======================================================
// 12. IMPROVE PROJECT DESCRIPTION
// ======================================================

app.post("/api/improve-project", async (req, res) => {

    try {

        const {
            projectName,
            technologies,
            description
        } = req.body;


        const prompt = `
Improve this project description for a professional CV.

Project Name:
${projectName || "Not provided"}

Technologies:
${technologies || "Not provided"}

Current Description:
${description || "Not provided"}


Requirements:

- Make it professional.
- Make it ATS-friendly.
- Mention technologies naturally.
- Keep the information truthful.
- Do not invent features.
- Do not invent achievements.
- Do not invent numbers.
- Write 2 to 4 concise bullet points.
- Return ONLY the improved description.
`;


        const improved =
            await askAI(prompt);


        res.json({

            success: true,

            description:
                improved.trim()

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to improve project."

        });

    }

});


// ======================================================
// 13. ANALYZE COMPLETE CV
// ======================================================

app.post("/api/analyze-cv", async (req, res) => {

    try {

        const {
            name,
            jobTitle,
            summary,
            skills,
            experience,
            education,
            projects,
            certifications
        } = req.body;


        const prompt = `
Analyze this CV as a professional ATS resume consultant.

Candidate Name:
${name || "Not provided"}

Job Title:
${jobTitle || "Not provided"}

Summary:
${summary || "Not provided"}

Skills:
${skills || "Not provided"}

Experience:
${experience || "Not provided"}

Education:
${education || "Not provided"}

Projects:
${projects || "Not provided"}

Certifications:
${certifications || "Not provided"}


Provide the analysis using these sections:

1. CV Overview

2. Strengths

3. Missing Information

4. Improvement Suggestions

5. ATS Optimization

6. Professional Recommendations


Important:

- Do not invent facts.
- Do not claim the candidate has experience they did not provide.
- Do not invent qualifications.
- Do not invent achievements.
- Give practical suggestions.
- Keep the analysis professional.
- Clearly explain what can be improved.
`;


        const analysis =
            await askAI(prompt);


        res.json({

            success: true,

            analysis:
                analysis.trim()

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to analyze CV."

        });

    }

});


// ======================================================
// 14. 404 ERROR HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API route not found."

    });

});


// ======================================================
// 15. GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error(
        "❌ Server Error:",
        err
    );


    res.status(500).json({

        success: false,

        message:
            "Internal server error."

    });

});


// ======================================================
// 16. START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("");

    console.log("======================================");
    console.log("🚀 AI CV BUILDER BACKEND");
    console.log("======================================");

    console.log("");

    console.log("✅ Server running on:");

    console.log(
        `http://localhost:${PORT}`
    );

    console.log("");

    console.log("Available AI routes:");

    console.log(
        "POST /api/generate-summary"
    );

    console.log(
        "POST /api/suggest-skills"
    );

    console.log(
        "POST /api/improve-experience"
    );

    console.log(
        "POST /api/improve-project"
    );

    console.log(
        "POST /api/analyze-cv"
    );

    console.log("");

    console.log("======================================");

    console.log("");

});