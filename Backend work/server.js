// ======================================================
// AI CV BUILDER - BACKEND SERVER (FIXED)
// Node.js + Express + OpenAI
// Vercel Ready
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors({
    origin: true,                       // development ke liye theek hai
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "2mb" }));

// ======================================================
// HELPERS
// ======================================================

function safeString(value) {
    if (value === null || value === undefined) return "Not provided";
    if (typeof value === "string") return value.trim() || "Not provided";
    if (Array.isArray(value)) {
        if (value.length === 0) return "Not provided";
        return JSON.stringify(value, null, 2);
    }
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
}

async function askAI(prompt) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured on Vercel.");
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",          // cheap + fast + good quality
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional CV and resume writing assistant. " +
                        "Always keep information truthful. " +
                        "Never invent experience, education, certifications, " +
                        "achievements, skills, numbers or responsibilities. " +
                        "Return clean text only (no markdown headings unless asked)."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.4,
            max_tokens: 1200
        });

        const text = response.choices?.[0]?.message?.content?.trim();

        if (!text) {
            throw new Error("OpenAI returned an empty response.");
        }

        return text;

    } catch (error) {
        console.error("OPENAI API ERROR:", error);
        throw error;
    }
}

// ======================================================
// ROUTES
// ======================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI CV Builder Backend is running 🚀",
        status: "online"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        status: "online"
    });
});

app.get("/api/check-key", (req, res) => {
    res.status(200).json({
        success: true,
        configured: Boolean(process.env.OPENAI_API_KEY)
    });
});

// ======================================================
// 1. GENERATE SUMMARY
// ======================================================

app.post("/api/generate-summary", async (req, res) => {
    try {
        // Frontend both "role" and "jobTitle" bhej sakta hai
        const name = req.body.name;
        const jobTitle = req.body.jobTitle || req.body.role;
        const skills = req.body.skills;
        const experience = req.body.experience;
        const education = req.body.education;
        const projects = req.body.projects;

        const prompt = `
Create a professional ATS-friendly CV summary.

Candidate Name: ${safeString(name)}
Job Title: ${safeString(jobTitle)}
Skills: ${safeString(skills)}
Experience: ${safeString(experience)}
Education: ${safeString(education)}
Projects: ${safeString(projects)}

Requirements:
- Write 3 to 5 professional sentences.
- Make it suitable for a modern CV.
- Make it ATS-friendly.
- Highlight relevant skills.
- Keep information truthful.
- Do not invent experience, achievements or qualifications.
- Do not use a heading.
- Return ONLY the summary text.
`;

        const summary = await askAI(prompt);

        res.status(200).json({
            success: true,
            summary: summary
        });

    } catch (error) {
        console.error("Generate Summary Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate CV summary."
        });
    }
});

// ======================================================
// 2. SUGGEST SKILLS
// ======================================================

app.post("/api/suggest-skills", async (req, res) => {
    try {
        const jobTitle = req.body.jobTitle || req.body.role;
        const existingSkills = req.body.existingSkills || req.body.currentSkills || req.body.skills;

        const prompt = `
Suggest professional skills for this CV.

Job Title: ${safeString(jobTitle)}
Existing Skills: ${safeString(existingSkills)}

Requirements:
- Suggest 8 to 12 relevant professional skills.
- Do not repeat existing skills.
- Skills must be realistic for the job.
- Do not invent certifications or experience.
- Return ONLY valid JSON array of strings.
- Do not use markdown.
- Do not add explanations.

Example:
["HTML", "CSS", "JavaScript", "Git", "Responsive Design"]
`;

        const result = await askAI(prompt);

        const cleaned = result
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        let skills;
        try {
            skills = JSON.parse(cleaned);
        } catch {
            throw new Error("AI returned invalid skills format.");
        }

        if (!Array.isArray(skills)) {
            throw new Error("AI skills response is not an array.");
        }

        skills = skills
            .filter(s => typeof s === "string")
            .map(s => s.trim())
            .filter(Boolean);

        res.status(200).json({
            success: true,
            skills
        });

    } catch (error) {
        console.error("Suggest Skills Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate skills."
        });
    }
});

// ======================================================
// 3. IMPROVE EXPERIENCE
// ======================================================

app.post("/api/improve-experience", async (req, res) => {
    try {
        const { jobTitle, company, description } = req.body;

        const prompt = `
Improve this work experience for a professional CV.

Job Title: ${safeString(jobTitle)}
Company: ${safeString(company)}
Original Description: ${safeString(description)}

Requirements:
- Make it professional and ATS-friendly.
- Use strong professional language.
- Keep the candidate's original facts.
- Do not invent achievements or numbers.
- Create 3 to 5 concise bullet points.
- Return ONLY the bullet points (each starting with • or -).
`;

        const improved = await askAI(prompt);

        res.status(200).json({
            success: true,
            experience: improved,               // frontend dono names accept karta hai
            improvedExperience: improved
        });

    } catch (error) {
        console.error("Improve Experience Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to improve experience."
        });
    }
});

// ======================================================
// 4. IMPROVE PROJECT
// ======================================================

app.post("/api/improve-project", async (req, res) => {
    try {
        // Frontend "name" bhejta hai, backend "projectName" bhi accept kare
        const projectName = req.body.projectName || req.body.name;
        const technologies = req.body.technologies;
        const description = req.body.description;

        const prompt = `
Improve this project description for a professional CV.

Project Name: ${safeString(projectName)}
Technologies: ${safeString(technologies)}
Current Description: ${safeString(description)}

Requirements:
- Make it professional and ATS-friendly.
- Mention technologies naturally.
- Keep the information truthful.
- Do not invent features or achievements.
- Write 2 to 4 concise bullet points.
- Return ONLY the improved description.
`;

        const improved = await askAI(prompt);

        res.status(200).json({
            success: true,
            description: improved,
            improvedProject: improved,          // frontend yeh bhi dhundta hai
            project: improved
        });

    } catch (error) {
        console.error("Improve Project Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to improve project."
        });
    }
});

// ======================================================
// 5. ANALYZE CV
// ======================================================

app.post("/api/analyze-cv", async (req, res) => {
    try {
        const name = req.body.name;
        const jobTitle = req.body.jobTitle || req.body.role;
        const summary = req.body.summary;
        const skills = req.body.skills;
        const experience = req.body.experience;
        const education = req.body.education;
        const projects = req.body.projects;
        const certifications = req.body.certifications;

        const prompt = `
Analyze this CV as a professional ATS resume consultant.

Candidate Name: ${safeString(name)}
Job Title: ${safeString(jobTitle)}
Summary: ${safeString(summary)}
Skills: ${safeString(skills)}
Experience: ${safeString(experience)}
Education: ${safeString(education)}
Projects: ${safeString(projects)}
Certifications: ${safeString(certifications)}

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
- Give practical suggestions.
- Keep the analysis professional.
`;

        const analysis = await askAI(prompt);

        res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Analyze CV Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze CV."
        });
    }
});

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
        path: req.originalUrl
    });
});

// ======================================================
// LOCAL + VERCEL
// ======================================================

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log("======================================");
        console.log("🚀 AI CV BUILDER BACKEND (FIXED)");
        console.log(`Server running on http://localhost:${PORT}`);
        console.log("======================================");
    });
}

module.exports = app;