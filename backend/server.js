// ======================================================
// AI CV BUILDER - MAIN BACKEND SERVER
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

// ======================================================
// CONFIGURATION
// ======================================================

const PORT = process.env.PORT || 5000;

const OPENAI_MODEL =
    process.env.OPENAI_MODEL || "gpt-5.6-luna";

// ======================================================
// OPENAI CLIENT
// ======================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

// ======================================================
// ROOT ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI CV Builder Backend is running 🚀",
        status: "online"
    });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        status: "online"
    });
});

// ======================================================
// OPENAI API KEY CHECK
// ======================================================

app.get("/api/check-key", (req, res) => {
    res.status(200).json({
        success: true,
        configured: Boolean(
            process.env.OPENAI_API_KEY
        ),
        model: OPENAI_MODEL
    });
});

// ======================================================
// ERROR HANDLER FUNCTION
// ======================================================

function sendError(
    res,
    error,
    defaultMessage
) {
    console.error(
        "======================================"
    );

    console.error(defaultMessage);
    console.error(error);

    console.error(
        "======================================"
    );

    let message = defaultMessage;

    if (error && error.message) {
        message = error.message;
    }

    res.status(500).json({
        success: false,
        message
    });
}

// ======================================================
// AI FUNCTION
// ======================================================

async function askAI(prompt) {

    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is not configured."
        );
    }

    if (
        !prompt ||
        !String(prompt).trim()
    ) {
        throw new Error(
            "AI prompt cannot be empty."
        );
    }

    try {

        const response =
            await openai.responses.create({

                model: OPENAI_MODEL,

                instructions:
                    "You are a professional CV and resume writing assistant. " +
                    "Always keep information truthful. " +
                    "Never invent experience, education, certifications, " +
                    "achievements, skills, numbers or responsibilities. " +
                    "Only use information provided by the candidate.",

                input: String(prompt)
            });

        if (!response) {
            throw new Error(
                "OpenAI returned no response."
            );
        }

        const outputText =
            response.output_text;

        if (
            !outputText ||
            !outputText.trim()
        ) {
            throw new Error(
                "OpenAI returned an empty response."
            );
        }

        return outputText.trim();

    } catch (error) {

        console.error(
            "OPENAI API ERROR:",
            error
        );

        throw error;
    }
}

// ======================================================
// GENERATE PROFESSIONAL SUMMARY
// ======================================================

app.post(
    "/api/generate-summary",
    async (req, res) => {

        try {

            const {
                name,
                title,
                skills,
                experience,
                education
            } = req.body;

            const prompt = `
Create a professional CV summary.

Candidate Name:
${name || "Not provided"}

Professional Title:
${title || "Not provided"}

Skills:
${skills || "Not provided"}

Experience:
${experience || "Not provided"}

Education:
${education || "Not provided"}

Requirements:
- Write a professional CV summary.
- Keep it concise.
- Use only the information provided.
- Do not invent facts.
- Do not use fake achievements.
- Do not mention information that was not provided.
`;

            const result =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                summary: result
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to generate professional summary."
            );
        }
    }
);

// ======================================================
// SUGGEST SKILLS
// ======================================================

app.post(
    "/api/suggest-skills",
    async (req, res) => {

        try {

            const {
                title,
                existingSkills,
                experience,
                education
            } = req.body;

            const prompt = `
Suggest relevant professional skills for a CV.

Professional Title:
${title || "Not provided"}

Existing Skills:
${existingSkills || "Not provided"}

Experience:
${experience || "Not provided"}

Education:
${education || "Not provided"}

Requirements:
- Suggest skills relevant to the information provided.
- Do not invent qualifications.
- Do not claim the candidate already possesses a skill.
- Return a clean list of skill suggestions.
`;

            const result =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                skills: result
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to suggest skills."
            );
        }
    }
);

// ======================================================
// IMPROVE EXPERIENCE
// ======================================================

app.post(
    "/api/improve-experience",
    async (req, res) => {

        try {

            const {
                experience,
                jobTitle,
                company
            } = req.body;

            const prompt = `
Improve the following CV work experience.

Job Title:
${jobTitle || "Not provided"}

Company:
${company || "Not provided"}

Experience:
${experience || "Not provided"}

Requirements:
- Improve grammar and professional wording.
- Make the description CV-friendly.
- Preserve the original meaning.
- Do not invent responsibilities.
- Do not invent achievements.
- Do not add fake numbers.
`;

            const result =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                experience: result
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to improve experience."
            );
        }
    }
);

// ======================================================
// IMPROVE PROJECT
// ======================================================

app.post(
    "/api/improve-project",
    async (req, res) => {

        try {

            const {
                projectName,
                projectDescription,
                technologies
            } = req.body;

            const prompt = `
Improve this project description for a professional CV.

Project Name:
${projectName || "Not provided"}

Description:
${projectDescription || "Not provided"}

Technologies:
${technologies || "Not provided"}

Requirements:
- Make the description professional.
- Keep it concise.
- Preserve factual information.
- Do not invent features.
- Do not invent results or statistics.
- Do not claim technologies that were not provided.
`;

            const result =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                project: result
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to improve project."
            );
        }
    }
);

// ======================================================
// ANALYZE CV
// ======================================================

app.post(
    "/api/analyze-cv",
    async (req, res) => {

        try {

            const {
                cvText
            } = req.body;

            if (
                !cvText ||
                !String(cvText).trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "CV text is required."
                });
            }

            const prompt = `
Analyze the following CV.

CV:
${cvText}

Provide useful professional feedback about:

1. Professional summary
2. Skills
3. Experience
4. Education
5. Projects
6. Certifications
7. Formatting
8. Grammar
9. Clarity
10. Areas for improvement

Requirements:
- Only analyze the information provided.
- Do not invent facts.
- Give practical suggestions.
- Keep the feedback professional.
`;

            const result =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                analysis: result
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to analyze CV."
            );
        }
    }
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API route not found.",
            path: req.originalUrl
        });
    }
);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal server error."
        });
    }
);

// ======================================================
// LOCAL SERVER
// ======================================================

if (require.main === module) {

    app.listen(
        PORT,
        () => {

            console.log(
                "======================================"
            );

            console.log(
                "🚀 AI CV BUILDER BACKEND"
            );

            console.log(
                "======================================"
            );

            console.log(
                `Server running on http://localhost:${PORT}`
            );

            console.log(
                `OpenAI Model: ${OPENAI_MODEL}`
            );

            console.log(
                `API Key Configured: ${Boolean(
                    process.env.OPENAI_API_KEY
                )}`
            );

            console.log(
                "======================================"
            );
        }
    );
}

// ======================================================
// EXPORT EXPRESS APP FOR VERCEL
// ======================================================

module.exports = app;