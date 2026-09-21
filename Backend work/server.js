// ======================================================
// AI CV BUILDER - BACKEND SERVER
// Node.js + Express + OpenAI
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// ======================================================
// 1. LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// 2. CREATE EXPRESS APP
// ======================================================

const app = express();

// ======================================================
// 3. CONFIGURATION
// ======================================================

const PORT = process.env.PORT || 5000;

const OPENAI_MODEL =
    process.env.OPENAI_MODEL || "gpt-5.6-luna";

// ======================================================
// 4. OPENAI CLIENT
// ======================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ======================================================
// 5. MIDDLEWARE
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
// 6. BASIC TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI CV Builder Backend is running 🚀",
        status: "online"
    });
});

// ======================================================
// 7. HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        status: "online"
    });
});

// ======================================================
// 8. CHECK API KEY
// ======================================================

app.get("/api/check-key", (req, res) => {
    res.status(200).json({
        success: true,
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: OPENAI_MODEL
    });
});

// ======================================================
// 9. COMMON ERROR HANDLER
// ======================================================

function sendError(res, error, defaultMessage) {
    console.error("======================================");
    console.error(defaultMessage);
    console.error(error);
    console.error("======================================");

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
// 10. AI HELPER FUNCTION
// ======================================================

async function askAI(prompt) {

    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is not configured."
        );
    }

    if (!prompt || !String(prompt).trim()) {
        throw new Error(
            "AI prompt cannot be empty."
        );
    }

    try {

        const response = await openai.responses.create({
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

        const outputText = response.output_text;

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
// 11. GENERATE CV SUMMARY
// ======================================================

app.post(
    "/api/generate-summary",
    async (req, res) => {

        try {

            const {
                name,
                jobTitle,
                skills,
                experience,
                education
            } = req.body || {};

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
- Do not invent numbers.
- Do not use a heading.
- Return ONLY the summary.
`;

            const summary =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                summary
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to generate CV summary."
            );
        }
    }
);

// ======================================================
// 12. SUGGEST SKILLS
// ======================================================

app.post(
    "/api/suggest-skills",
    async (req, res) => {

        try {

            const {
                jobTitle,
                existingSkills
            } = req.body || {};

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

            const result =
                await askAI(prompt);

            const cleanedResult =
                result
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

            let skills;

            try {

                skills =
                    JSON.parse(cleanedResult);

            } catch (parseError) {

                console.error(
                    "Invalid AI JSON:",
                    cleanedResult
                );

                throw new Error(
                    "AI returned invalid skills format."
                );
            }

            if (!Array.isArray(skills)) {
                throw new Error(
                    "AI skills response is not an array."
                );
            }

            skills = skills
                .filter(
                    skill =>
                        typeof skill === "string"
                )
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean);

            res.status(200).json({
                success: true,
                skills
            });

        } catch (error) {

            sendError(
                res,
                error,
                "Failed to generate skills."
            );
        }
    }
);

// ======================================================
// 13. IMPROVE WORK EXPERIENCE
// ======================================================

app.post(
    "/api/improve-experience",
    async (req, res) => {

        try {

            const {
                jobTitle,
                company,
                description
            } = req.body || {};

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

            res.status(200).json({
                success: true,
                experience:
                    improvedExperience
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
// 14. IMPROVE PROJECT
// ======================================================

app.post(
    "/api/improve-project",
    async (req, res) => {

        try {

            const {
                projectName,
                technologies,
                description
            } = req.body || {};

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

            res.status(200).json({
                success: true,
                description: improved
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
// 15. ANALYZE COMPLETE CV
// ======================================================

app.post(
    "/api/analyze-cv",
    async (req, res) => {

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
            } = req.body || {};

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
`;

            const analysis =
                await askAI(prompt);

            res.status(200).json({
                success: true,
                analysis
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
// 16. 404 HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found.",
        path: req.originalUrl
    });
});

// ======================================================
// 17. GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal server error."
        });
    }
);

// ======================================================
// 18. START LOCAL SERVER
// ======================================================

if (require.main === module) {

    app.listen(PORT, () => {

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
    });
}

// ======================================================
// 19. EXPORT FOR VERCEL
// ======================================================

module.exports = app;