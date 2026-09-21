/* =========================================================
   AI CV BUILDER
   COMPLETE FRONTEND JAVASCRIPT
   Version 1.0
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const APP_CONFIG = {
    storageKey: "ai_cv_builder_data_v1",

    /*
        Local development:
        http://localhost:5000/api

        Production:
        /api
    */
    apiBase:
    window.location.protocol === "file:"
        ? "http://localhost:5000/api"
        : (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000/api"
                : "https://ai-cv-builder-backend.vercel.app/api"
        ),

    maxPhotoSize: 5 * 1024 * 1024,

    pdfFileName: "Professional-CV.pdf",

    autosaveDelay: 500,

    toastDuration: 3000
};


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentTemplate = 1;

let experienceCount = 0;
let educationCount = 0;
let projectCount = 0;
let certificationCount = 0;
let languageCount = 0;

let autosaveTimer = null;
let toastTimer = null;

let isRestoringData = false;

let currentPhotoData = "";


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, parent = document) {
    return parent.querySelector(selector);
}


function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}


function getElement(id) {
    return document.getElementById(id);
}


function safeText(value) {
    return String(value ?? "").trim();
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalizeText(value) {
    return safeText(value)
        .replace(/\s+/g, " ")
        .trim();
}


function debounceSave() {

    clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(() => {
        saveCVData();
    }, APP_CONFIG.autosaveDelay);
}


/* =========================================================
   TOAST SYSTEM
========================================================= */

function showToast(message, type = "success") {

    const toast = getElement("toast");
    const toastMessage = getElement("toastMessage");
    const toastIcon = getElement("toastIcon");

    if (!toast || !toastMessage) {
        return;
    }

    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    if (toastIcon) {

        toastIcon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : type === "warning"
                    ? "fa-solid fa-triangle-exclamation"
                    : "fa-solid fa-circle-check";
    }

    toast.classList.remove("show", "error", "warning");

    if (type === "error") {
        toast.classList.add("error");
    }

    if (type === "warning") {
        toast.classList.add("warning");
    }

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, APP_CONFIG.toastDuration);
}


/* =========================================================
   BUTTON LOADING STATE
========================================================= */

function setButtonLoading(button, loading, loadingText = "Working...") {

    if (!button) {
        return;
    }

    if (loading) {

        if (!button.dataset.originalHTML) {
            button.dataset.originalHTML = button.innerHTML;
        }

        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ${escapeHTML(loadingText)}
        `;

    } else {

        button.disabled = false;

        if (button.dataset.originalHTML) {
            button.innerHTML = button.dataset.originalHTML;
        }
    }
}


/* =========================================================
   COUNTRY → CITY DATA
========================================================= */

const countryCities = {

    Pakistan: [
        "Karachi",
        "Lahore",
        "Islamabad",
        "Rawalpindi",
        "Faisalabad",
        "Multan",
        "Peshawar",
        "Quetta",
        "Hyderabad",
        "Sialkot",
        "Gujranwala",
        "Bahawalpur",
        "Sukkur",
        "Abbottabad",
        "Mardan"
    ],

    India: [
        "Mumbai",
        "Delhi",
        "Bangalore",
        "Hyderabad",
        "Chennai",
        "Kolkata",
        "Pune",
        "Ahmedabad",
        "Jaipur",
        "Surat"
    ],

    "United Arab Emirates": [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Al Ain",
        "Ras Al Khaimah"
    ],

    "Saudi Arabia": [
        "Riyadh",
        "Jeddah",
        "Mecca",
        "Medina",
        "Dammam",
        "Khobar",
        "Taif"
    ],

    "United Kingdom": [
        "London",
        "Manchester",
        "Birmingham",
        "Liverpool",
        "Leeds",
        "Bristol",
        "Glasgow",
        "Edinburgh"
    ],

    "United States": [
        "New York",
        "Los Angeles",
        "Chicago",
        "Houston",
        "Phoenix",
        "Philadelphia",
        "San Antonio",
        "San Diego",
        "Dallas",
        "San Francisco"
    ],

    Canada: [
        "Toronto",
        "Vancouver",
        "Montreal",
        "Calgary",
        "Ottawa",
        "Edmonton",
        "Winnipeg"
    ],

    Australia: [
        "Sydney",
        "Melbourne",
        "Brisbane",
        "Perth",
        "Adelaide",
        "Canberra",
        "Gold Coast"
    ],

    Germany: [
        "Berlin",
        "Munich",
        "Hamburg",
        "Frankfurt",
        "Cologne",
        "Stuttgart",
        "Düsseldorf"
    ],

    Other: []
};


/* =========================================================
   CAREER ROLE DATA
========================================================= */

const careerRoles = {

    Technology: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Software Engineer",
        "Web Developer",
        "Mobile App Developer",
        "AI Engineer",
        "Machine Learning Engineer",
        "Data Scientist",
        "DevOps Engineer",
        "Cybersecurity Analyst",
        "Cloud Engineer",
        "UI/UX Designer",
        "QA Engineer"
    ],

    Healthcare: [
        "Medical Officer",
        "Registered Nurse",
        "Medical Assistant",
        "Pharmacist",
        "Healthcare Administrator",
        "Medical Laboratory Technologist",
        "Physiotherapist",
        "Clinical Research Associate"
    ],

    Engineering: [
        "Software Engineer",
        "Civil Engineer",
        "Mechanical Engineer",
        "Electrical Engineer",
        "Electronics Engineer",
        "Chemical Engineer",
        "Industrial Engineer",
        "Project Engineer",
        "Quality Engineer"
    ],

    Business: [
        "Business Analyst",
        "Business Development Executive",
        "Operations Manager",
        "Business Consultant",
        "Project Manager",
        "Product Manager",
        "Entrepreneur",
        "Management Trainee"
    ],

    Finance: [
        "Financial Analyst",
        "Accountant",
        "Investment Analyst",
        "Finance Manager",
        "Audit Associate",
        "Tax Consultant",
        "Banking Officer",
        "Risk Analyst"
    ],

    Marketing: [
        "Digital Marketing Specialist",
        "SEO Specialist",
        "Content Strategist",
        "Social Media Manager",
        "Marketing Executive",
        "Brand Manager",
        "Growth Marketing Specialist",
        "Performance Marketing Specialist"
    ],

    Education: [
        "Teacher",
        "Lecturer",
        "Academic Coordinator",
        "Education Consultant",
        "Curriculum Developer",
        "Instructional Designer",
        "Teaching Assistant"
    ],

    Design: [
        "UI/UX Designer",
        "Graphic Designer",
        "Product Designer",
        "Web Designer",
        "Visual Designer",
        "Motion Graphics Designer",
        "Brand Designer"
    ],

    Legal: [
        "Legal Assistant",
        "Legal Advisor",
        "Corporate Lawyer",
        "Legal Consultant",
        "Compliance Officer",
        "Paralegal"
    ],

    Science: [
        "Research Scientist",
        "Laboratory Scientist",
        "Research Assistant",
        "Data Scientist",
        "Biotechnologist",
        "Environmental Scientist",
        "Scientific Researcher"
    ],

    Hospitality: [
        "Hotel Manager",
        "Front Office Manager",
        "Guest Relations Officer",
        "Event Coordinator",
        "Restaurant Manager",
        "Hospitality Executive",
        "Travel Consultant"
    ],

    Other: [
        "Professional",
        "Specialist",
        "Consultant",
        "Coordinator",
        "Executive",
        "Manager"
    ]
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", initializeApp);


function initializeApp() {

    try {

        setupCountryCity();

        setupPhotoUpload();

        setupLivePreview();

        setupModalBehavior();

        setupGlobalKeyboardEvents();

        setupFormEvents();

        setupInitialRepeatableItems();

        updateAllPreviews();

        restoreCVData();

        updateAllPreviews();

        updateCounters();

        setCurrentDateLimits();

    } catch (error) {

        console.error("AI CV Builder initialization error:", error);

        showToast(
            "Some frontend features could not initialize.",
            "error"
        );
    }
}


/* =========================================================
   DATE LIMITS
========================================================= */

function setCurrentDateLimits() {

    const dob = getElement("dateOfBirth");

    if (dob) {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        dob.max = `${year}-${month}-${day}`;
    }
}


/* =========================================================
   INITIAL REPEATABLE ITEMS
========================================================= */

function setupInitialRepeatableItems() {

    experienceCount =
        $$(".experience-item").length;

    educationCount =
        $$(".education-item").length;

    projectCount =
        $$(".project-item").length;

    certificationCount =
        $$(".certification-item").length;

    languageCount =
        $$(".language-item").length;
}


/* =========================================================
   COUNTRY / CITY
========================================================= */

function setupCountryCity() {

    const country = getElement("country");
    const city = getElement("city");

    if (!country || !city) {
        return;
    }

    country.addEventListener("change", () => {

        const selectedCountry = country.value;

        updateCityOptions(selectedCountry);

        updateLocation();

        updateAllPreviews();

        debounceSave();
    });

    city.addEventListener("change", () => {

        updateLocation();

        updateAllPreviews();

        debounceSave();
    });
}


function updateCityOptions(countryName, selectedCity = "") {

    const city = getElement("city");

    if (!city) {
        return;
    }

    city.innerHTML = "";

    if (!countryName) {

        city.disabled = true;

        const option = document.createElement("option");

        option.value = "";

        option.textContent =
            "Select country first";

        city.appendChild(option);

        return;
    }

    const cities =
        countryCities[countryName] || [];

    city.disabled = cities.length === 0;

    const placeholder =
        document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
        cities.length
            ? "Select City"
            : "City not available";

    city.appendChild(placeholder);

    cities.forEach(cityName => {

        const option =
            document.createElement("option");

        option.value = cityName;

        option.textContent = cityName;

        city.appendChild(option);
    });

    if (
        selectedCity &&
        cities.includes(selectedCity)
    ) {
        city.value = selectedCity;
    }
}


function updateLocation() {

    const country = getElement("country");
    const city = getElement("city");
    const location = getElement("location");

    if (!country || !city || !location) {
        return;
    }

    const countryValue =
        safeText(country.value);

    const cityValue =
        safeText(city.value);

    let result = "";

    if (cityValue && countryValue) {
        result = `${cityValue}, ${countryValue}`;
    } else if (countryValue) {
        result = countryValue;
    }

    location.value = result;
}


/* =========================================================
   PHOTO UPLOAD
========================================================= */

function setupPhotoUpload() {

    const input = getElement("profilePhoto");

    if (!input) {
        return;
    }

    input.addEventListener("change", handlePhotoUpload);
}


function handlePhotoUpload(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please select a valid image file.",
            "error"
        );

        event.target.value = "";

        return;
    }

    if (file.size > APP_CONFIG.maxPhotoSize) {

        showToast(
            "Photo size must be 5 MB or smaller.",
            "error"
        );

        event.target.value = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        currentPhotoData =
            reader.result;

        renderPhoto(currentPhotoData);

        debounceSave();

        showToast(
            "Profile photo added successfully."
        );
    };

    reader.onerror = function () {

        showToast(
            "Unable to read the selected photo.",
            "error"
        );
    };

    reader.readAsDataURL(file);
}


function renderPhoto(src) {

    const preview =
        getElement("photoPreview");

    const previewPhoto =
        getElement("previewPhoto");

    const defaultIcon =
        getElement("defaultPhotoIcon");

    if (preview) {

        preview.innerHTML = "";

        if (src) {

            const img =
                document.createElement("img");

            img.src = src;

            img.alt = "Profile Photo";

            preview.appendChild(img);

        } else {

            const icon =
                document.createElement("i");

            icon.className =
                "fa-solid fa-user";

            preview.appendChild(icon);
        }
    }

    if (previewPhoto) {

        if (src) {

            previewPhoto.src = src;

            previewPhoto.style.display =
                "block";

            if (defaultIcon) {
                defaultIcon.style.display =
                    "none";
            }

        } else {

            previewPhoto.removeAttribute("src");

            previewPhoto.style.display =
                "none";

            if (defaultIcon) {
                defaultIcon.style.display =
                    "block";
            }
        }
    }
}


/* =========================================================
   LIVE PREVIEW EVENTS
========================================================= */

function setupLivePreview() {

    document.addEventListener(
        "input",
        handleLiveInput
    );

    document.addEventListener(
        "change",
        handleLiveChange
    );
}


function handleLiveInput(event) {

    const target =
        event.target;

    if (!target) {
        return;
    }

    if (
        target.matches(
            "input, textarea, select"
        )
    ) {

        updateAllPreviews();

        debounceSave();
    }
}


function handleLiveChange(event) {

    const target =
        event.target;

    if (!target) {
        return;
    }

    if (
        target.matches(
            "input, textarea, select"
        )
    ) {

        updateAllPreviews();

        debounceSave();
    }
}


/* =========================================================
   FORM EVENTS
========================================================= */

function setupFormEvents() {

    const dob =
        getElement("dateOfBirth");

    if (dob) {

        dob.addEventListener(
            "change",
            validateDateOfBirth
        );
    }

    const phone =
        getElement("phone");

    if (phone) {

        phone.addEventListener(
            "input",
            () => {

                phone.value =
                    phone.value
                        .replace(
                            /[^0-9+\-() ]/g,
                            ""
                        )
                        .slice(0, 20);
            }
        );
    }
}


function validateDateOfBirth() {

    const dob =
        getElement("dateOfBirth");

    if (!dob || !dob.value) {
        return true;
    }

    const selected =
        new Date(
            `${dob.value}T00:00:00`
        );

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    if (selected > today) {

        dob.value = "";

        showToast(
            "Date of birth cannot be in the future.",
            "error"
        );

        return false;
    }

    return true;
}


/* =========================================================
   CAREER FIELD
========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target &&
            event.target.id === "careerField"
        ) {

            updateCareerRoles(
                event.target.value
            );

            updateCareerGuide(
                event.target.value
            );

            debounceSave();
        }
    }
);


function updateCareerRoles(field) {

    const container =
        getElement("careerRoleOptions");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!field) {

        const placeholder =
            document.createElement("div");

        placeholder.className =
            "career-role-placeholder";

        placeholder.textContent =
            "Select a career field to see recommended job roles.";

        container.appendChild(
            placeholder
        );

        return;
    }

    const roles =
        careerRoles[field] ||
        careerRoles.Other;

    roles.forEach(role => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "career-role-option";

        button.textContent = role;

        button.addEventListener(
            "click",
            () => {

                const jobTitle =
                    getElement("jobTitle");

                if (jobTitle) {

                    jobTitle.value =
                        role;

                    updateAllPreviews();

                    debounceSave();

                    showToast(
                        `${role} selected.`
                    );
                }
            }
        );

        container.appendChild(button);
    });
}


function updateCareerGuide(field) {

    const guide =
        getElement("aiGuideContent");

    if (!guide) {
        return;
    }

    if (!field) {

        guide.textContent =
            "Select a career field to receive AI-powered career guidance.";

        return;
    }

    const guides = {

        Technology:
            "Focus on technical skills, projects, GitHub, frameworks, programming languages and measurable development achievements.",

        Healthcare:
            "Highlight clinical knowledge, certifications, practical experience, patient-care skills and relevant qualifications.",

        Engineering:
            "Showcase technical projects, engineering tools, problem-solving ability, internships and measurable project results.",

        Business:
            "Highlight leadership, communication, operations, strategy, business development and measurable achievements.",

        Finance:
            "Emphasize financial analysis, accounting, Excel, financial modeling, reporting and relevant certifications.",

        Marketing:
            "Highlight campaigns, SEO, social media, analytics, content creation and measurable marketing results.",

        Education:
            "Emphasize teaching experience, academic achievements, curriculum development and communication skills.",

        Design:
            "Showcase your portfolio, design tools, visual thinking, UX knowledge and completed design projects.",

        Legal:
            "Highlight legal research, documentation, compliance, internships, case-related experience and relevant qualifications.",

        Science:
            "Focus on research, laboratory experience, scientific methods, publications, data analysis and technical skills.",

        Hospitality:
            "Highlight customer service, communication, operations, event management and hospitality experience.",

        Other:
            "Choose skills, achievements and experience that directly match the role you want."
    };

    guide.textContent =
        guides[field] ||
        guides.Other;
}


/* =========================================================
   PROFESSIONAL ROLE SUGGESTION
========================================================= */

function suggestCareerRole() {

    const careerField =
        getElement("careerField");

    const jobTitle =
        getElement("jobTitle");

    if (!careerField || !jobTitle) {
        return;
    }

    if (!careerField.value) {

        showToast(
            "Please select a career field first.",
            "warning"
        );

        careerField.focus();

        return;
    }

    const roles =
        careerRoles[careerField.value] ||
        careerRoles.Other;

    if (!roles.length) {
        return;
    }

    const current =
        safeText(jobTitle.value);

    let availableRoles =
        roles.filter(
            role => role !== current
        );

    if (!availableRoles.length) {
        availableRoles = roles;
    }

    const randomRole =
        availableRoles[
            Math.floor(
                Math.random() *
                availableRoles.length
            )
        ];

    jobTitle.value =
        randomRole;

    updateAllPreviews();

    debounceSave();

    showToast(
        `Suggested role: ${randomRole}`
    );
}


/* =========================================================
   GENERIC REPEATABLE ITEM HELPERS
========================================================= */

function addRemoveButton(container) {

    if (!container) {
        return;
    }

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "remove-button";

    button.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Remove
    `;

    button.addEventListener(
        "click",
        () => {

            const item =
                button.closest(
                    ".repeatable-item"
                );

            if (!item) {
                return;
            }

            const parent =
                item.parentElement;

            const items =
                parent
                    ? parent.querySelectorAll(
                        ".repeatable-item"
                    )
                    : [];

            if (items.length <= 1) {

                clearRepeatableItem(item);

                showToast(
                    "The last item was cleared."
                );

                updateAllPreviews();

                debounceSave();

                return;
            }

            item.remove();

            updateCounters();

            updateAllPreviews();

            debounceSave();

            showToast(
                "Item removed."
            );
        }
    );

    container.appendChild(button);
}


function clearRepeatableItem(item) {

    if (!item) {
        return;
    }

    $$(
        "input, textarea, select",
        item
    ).forEach(field => {

        field.value = "";

    });
}


function createRepeatableItem(
    type,
    html
) {

    const item =
        document.createElement("div");

    item.className =
        `repeatable-item ${type}-item`;

    item.innerHTML =
        html;

    addRemoveButton(item);

    return item;
}


/* =========================================================
   EXPERIENCE
========================================================= */

function addExperience() {

    const container =
        getElement("experienceContainer");

    if (!container) {
        return;
    }

    const item =
        createRepeatableItem(
            "experience",
            `
            <div class="form-grid">

                <div class="form-group">
                    <label>Job Title</label>
                    <input
                        type="text"
                        class="experience-job-title"
                        placeholder="e.g. Frontend Developer"
                    >
                </div>

                <div class="form-group">
                    <label>Company</label>
                    <input
                        type="text"
                        class="experience-company"
                        placeholder="Company Name"
                    >
                </div>

                <div class="form-group">
                    <label>Start Date</label>
                    <input
                        type="month"
                        class="experience-start"
                    >
                </div>

                <div class="form-group">
                    <label>End Date</label>
                    <input
                        type="month"
                        class="experience-end"
                    >
                </div>

                <div class="form-group full-width">

                    <label>Description</label>

                    <textarea
                        class="experience-description"
                        rows="5"
                        placeholder="Describe your responsibilities..."
                    ></textarea>

                    <button
                        type="button"
                        class="ai-button"
                        onclick="improveExperience(this)"
                    >
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        Improve with AI
                    </button>

                </div>

            </div>
            `
        );

    container.appendChild(item);

    experienceCount++;

    updateCounters();

    debounceSave();

    updateAllPreviews();

    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   EDUCATION
========================================================= */

function addEducation() {

    const container =
        getElement("educationContainer");

    if (!container) {
        return;
    }

    const item =
        createRepeatableItem(
            "education",
            `
            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Degree / Qualification
                    </label>

                    <input
                        type="text"
                        class="education-degree"
                        placeholder="e.g. Bachelor's in Computer Science"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Institution
                    </label>

                    <input
                        type="text"
                        class="education-institution"
                        placeholder="University / College"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Start Year
                    </label>

                    <input
                        type="number"
                        class="education-start"
                        placeholder="2022"
                        min="1950"
                        max="2100"
                    >

                </div>

                <div class="form-group">

                    <label>
                        End Year
                    </label>

                    <input
                        type="number"
                        class="education-end"
                        placeholder="2026"
                        min="1950"
                        max="2100"
                    >

                </div>

                <div class="form-group full-width">

                    <label>
                        Details
                    </label>

                    <textarea
                        class="education-details"
                        rows="3"
                        placeholder="Add relevant details..."
                    ></textarea>

                </div>

            </div>
            `
        );

    container.appendChild(item);

    educationCount++;

    updateCounters();

    debounceSave();

    updateAllPreviews();

    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   PROJECTS
========================================================= */

function addProject() {

    const container =
        getElement("projectsContainer");

    if (!container) {
        return;
    }

    const item =
        createRepeatableItem(
            "project",
            `
            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Project Name
                    </label>

                    <input
                        type="text"
                        class="project-name"
                        placeholder="e.g. AI CV Builder"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Technologies
                    </label>

                    <input
                        type="text"
                        class="project-technologies"
                        placeholder="HTML, CSS, JavaScript, Node.js"
                    >

                </div>

                <div class="form-group full-width">

                    <label>
                        Project Description
                    </label>

                    <textarea
                        class="project-description"
                        rows="5"
                        placeholder="Describe your project..."
                    ></textarea>

                    <button
                        type="button"
                        class="ai-button"
                        onclick="improveProject(this)"
                    >
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        Improve with AI
                    </button>

                </div>

            </div>
            `
        );

    container.appendChild(item);

    projectCount++;

    updateCounters();

    debounceSave();

    updateAllPreviews();

    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   CERTIFICATIONS
========================================================= */

function addCertification() {

    const container =
        getElement("certificationsContainer");

    if (!container) {
        return;
    }

    const item =
        createRepeatableItem(
            "certification",
            `
            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Certification Name
                    </label>

                    <input
                        type="text"
                        class="certification-name"
                        placeholder="e.g. Web Development"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Issuing Organization
                    </label>

                    <input
                        type="text"
                        class="certification-issuer"
                        placeholder="Organization Name"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Year
                    </label>

                    <input
                        type="number"
                        class="certification-year"
                        placeholder="2026"
                        min="1950"
                        max="2100"
                    >

                </div>

            </div>
            `
        );

    container.appendChild(item);

    certificationCount++;

    updateCounters();

    debounceSave();

    updateAllPreviews();

    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   LANGUAGES
========================================================= */

function addLanguage() {

    const container =
        getElement("languagesContainer");

    if (!container) {
        return;
    }

    const item =
        createRepeatableItem(
            "language",
            `
            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Language
                    </label>

                    <input
                        type="text"
                        class="language-name"
                        placeholder="e.g. English"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Proficiency
                    </label>

                    <select class="language-level">

                        <option value="">
                            Select Level
                        </option>

                        <option value="Native">
                            Native
                        </option>

                        <option value="Fluent">
                            Fluent
                        </option>

                        <option value="Advanced">
                            Advanced
                        </option>

                        <option value="Intermediate">
                            Intermediate
                        </option>

                        <option value="Basic">
                            Basic
                        </option>

                    </select>

                </div>

            </div>
            `
        );

    container.appendChild(item);

    languageCount++;

    updateCounters();

    debounceSave();

    updateAllPreviews();

    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   COUNTERS
========================================================= */

function updateCounters() {

    experienceCount =
        $$(".experience-item").length;

    educationCount =
        $$(".education-item").length;

    projectCount =
        $$(".project-item").length;

    certificationCount =
        $$(".certification-item").length;

    languageCount =
        $$(".language-item").length;
}


/* =========================================================
   MAIN PREVIEW UPDATE
========================================================= */

function updateAllPreviews() {

    updatePersonalPreview();

    updateSummaryPreview();

    updateExperiencePreview();

    updateEducationPreview();

    updateSkillsPreview();

    updateProjectsPreview();

    updateCertificationPreview();

    updateLanguagesPreview();

    updateTemplateClass();

    renderPhoto(currentPhotoData);
}


/* =========================================================
   PERSONAL PREVIEW
========================================================= */

function updatePersonalPreview() {

    const name =
        normalizeText(
            getElement("name")?.value
        );

    const jobTitle =
        normalizeText(
            getElement("jobTitle")?.value
        );

    const email =
        normalizeText(
            getElement("email")?.value
        );

    const phone =
        normalizeText(
            getElement("phone")?.value
        );

    const country =
        normalizeText(
            getElement("country")?.value
        );

    const city =
        normalizeText(
            getElement("city")?.value
        );

    const linkedin =
        normalizeText(
            getElement("linkedin")?.value
        );

    const github =
        normalizeText(
            getElement("github")?.value
        );


    setPreviewText(
        "previewName",
        name || "Your Name"
    );


    setPreviewText(
        "previewJobTitle",
        jobTitle || "Professional Title"
    );


    const emailPreview =
        getElement("previewEmail");

    if (emailPreview) {

        emailPreview.innerHTML = `
            <i class="fa-solid fa-envelope"></i>
            ${escapeHTML(
                email ||
                "email@example.com"
            )}
        `;
    }


    const phonePreview =
        getElement("previewPhone");

    if (phonePreview) {

        phonePreview.innerHTML = `
            <i class="fa-solid fa-phone"></i>
            ${escapeHTML(
                phone ||
                "+92 300 0000000"
            )}
        `;
    }


    let locationText = "";

    if (city && country) {
        locationText =
            `${city}, ${country}`;
    } else if (country) {
        locationText =
            country;
    } else {
        locationText =
            "Pakistan";
    }


    const locationPreview =
        getElement("previewLocation");

    if (locationPreview) {

        locationPreview.innerHTML = `
            <i class="fa-solid fa-location-dot"></i>
            ${escapeHTML(locationText)}
        `;
    }


    setPreviewText(
        "previewLinkedin",
        linkedin
            ? "LinkedIn"
            : ""
    );


    setPreviewText(
        "previewGithub",
        github
            ? "GitHub"
            : ""
    );


    setupPreviewLink(
        "previewLinkedin",
        linkedin
    );

    setupPreviewLink(
        "previewGithub",
        github
    );
}


function setPreviewText(
    id,
    value
) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.textContent =
        value;
}


function setupPreviewLink(
    id,
    url
) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.removeAttribute("title");

    if (!url) {

        element.style.display =
            "none";

        element.removeAttribute(
            "data-url"
        );

        return;
    }

    element.style.display =
        "inline";

    element.dataset.url =
        url;

    element.title =
        url;

    element.style.cursor =
        "pointer";

    element.onclick = () => {

        const normalized =
            normalizeURL(url);

        if (normalized) {
            window.open(
                normalized,
                "_blank",
                "noopener,noreferrer"
            );
        }
    };
}


function normalizeURL(url) {

    let value =
        normalizeText(url);

    if (!value) {
        return "";
    }

    if (
        !/^https?:\/\//i.test(value)
    ) {

        value =
            "https://" + value;
    }

    try {

        const parsed =
            new URL(value);

        if (
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ) {
            return "";
        }

        return parsed.href;

    } catch {

        return "";
    }
}


/* =========================================================
   SUMMARY PREVIEW
========================================================= */

function updateSummaryPreview() {

    const summary =
        normalizeText(
            getElement("summary")?.value
        );

    const section =
        getElement(
            "previewSummarySection"
        );

    const preview =
        getElement("previewSummary");

    if (!section || !preview) {
        return;
    }

    preview.textContent =
        summary ||
        "Your professional summary will appear here.";

    section.style.display =
        summary
            ? ""
            : "";
}


/* =========================================================
   EXPERIENCE PREVIEW
========================================================= */

function updateExperiencePreview() {

    const container =
        getElement("previewExperience");

    if (!container) {
        return;
    }

    const items =
        $$(".experience-item");

    const validItems =
        items.filter(item => {

            return (
                normalizeText(
                    $(".experience-job-title", item)?.value
                ) ||
                normalizeText(
                    $(".experience-company", item)?.value
                ) ||
                normalizeText(
                    $(".experience-start", item)?.value
                ) ||
                normalizeText(
                    $(".experience-end", item)?.value
                ) ||
                normalizeText(
                    $(".experience-description", item)?.value
                )
            );
        });

    if (!validItems.length) {

        container.innerHTML = `
            <div class="preview-empty">
                Work experience will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const title =
                normalizeText(
                    $(".experience-job-title", item)?.value
                );

            const company =
                normalizeText(
                    $(".experience-company", item)?.value
                );

            const start =
                formatMonth(
                    $(".experience-start", item)?.value
                );

            const end =
                formatMonth(
                    $(".experience-end", item)?.value
                );

            const description =
                normalizeText(
                    $(".experience-description", item)?.value
                );

            const date =
                buildDateRange(
                    start,
                    end
                );

            return `
                <article class="preview-item">

                    <div class="preview-item-header">

                        <div>

                            ${
                                title
                                    ? `<h4>${escapeHTML(title)}</h4>`
                                    : ""
                            }

                            ${
                                company
                                    ? `<strong>${escapeHTML(company)}</strong>`
                                    : ""
                            }

                        </div>

                        ${
                            date
                                ? `<span class="preview-date">${escapeHTML(date)}</span>`
                                : ""
                        }

                    </div>

                    ${
                        description
                            ? `<p>${escapeHTML(description).replace(/\n/g, "<br>")}</p>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   EDUCATION PREVIEW
========================================================= */

function updateEducationPreview() {

    const container =
        getElement("previewEducation");

    if (!container) {
        return;
    }

    const items =
        $$(".education-item");

    const validItems =
        items.filter(item => {

            return (
                normalizeText(
                    $(".education-degree", item)?.value
                ) ||
                normalizeText(
                    $(".education-institution", item)?.value
                ) ||
                normalizeText(
                    $(".education-start", item)?.value
                ) ||
                normalizeText(
                    $(".education-end", item)?.value
                ) ||
                normalizeText(
                    $(".education-details", item)?.value
                )
            );
        });

    if (!validItems.length) {

        container.innerHTML = `
            <div class="preview-empty">
                Education will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const degree =
                normalizeText(
                    $(".education-degree", item)?.value
                );

            const institution =
                normalizeText(
                    $(".education-institution", item)?.value
                );

            const start =
                normalizeText(
                    $(".education-start", item)?.value
                );

            const end =
                normalizeText(
                    $(".education-end", item)?.value
                );

            const details =
                normalizeText(
                    $(".education-details", item)?.value
                );

            const date =
                buildDateRange(
                    start,
                    end
                );

            return `
                <article class="preview-item">

                    <div class="preview-item-header">

                        <div>

                            ${
                                degree
                                    ? `<h4>${escapeHTML(degree)}</h4>`
                                    : ""
                            }

                            ${
                                institution
                                    ? `<strong>${escapeHTML(institution)}</strong>`
                                    : ""
                            }

                        </div>

                        ${
                            date
                                ? `<span class="preview-date">${escapeHTML(date)}</span>`
                                : ""
                        }

                    </div>

                    ${
                        details
                            ? `<p>${escapeHTML(details).replace(/\n/g, "<br>")}</p>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   SKILLS PREVIEW
========================================================= */

function updateSkillsPreview() {

    const container =
        getElement("previewSkills");

    const input =
        getElement("skills");

    if (!container || !input) {
        return;
    }

    const raw =
        safeText(input.value);

    const skills =
        parseCommaSeparated(
            raw
        );

    if (!skills.length) {

        container.innerHTML = `
            <span class="skill-placeholder">
                Skills will appear here.
            </span>
        `;

        return;
    }

    container.innerHTML =
        skills.map(skill => {

            return `
                <span class="skill-tag">
                    ${escapeHTML(skill)}
                </span>
            `;

        }).join("");
}


/* =========================================================
   PROJECTS PREVIEW
========================================================= */

function updateProjectsPreview() {

    const container =
        getElement("previewProjects");

    if (!container) {
        return;
    }

    const items =
        $$(".project-item");

    const validItems =
        items.filter(item => {

            return (
                normalizeText(
                    $(".project-name", item)?.value
                ) ||
                normalizeText(
                    $(".project-technologies", item)?.value
                ) ||
                normalizeText(
                    $(".project-description", item)?.value
                )
            );
        });

    if (!validItems.length) {

        container.innerHTML = `
            <div class="preview-empty">
                Projects will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const name =
                normalizeText(
                    $(".project-name", item)?.value
                );

            const technologies =
                normalizeText(
                    $(".project-technologies", item)?.value
                );

            const description =
                normalizeText(
                    $(".project-description", item)?.value
                );

            return `
                <article class="preview-item">

                    ${
                        name
                            ? `<h4>${escapeHTML(name)}</h4>`
                            : ""
                    }

                    ${
                        technologies
                            ? `<div class="preview-technologies">
                                ${escapeHTML(technologies)}
                               </div>`
                            : ""
                    }

                    ${
                        description
                            ? `<p>${escapeHTML(description).replace(/\n/g, "<br>")}</p>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   CERTIFICATION PREVIEW
========================================================= */

function updateCertificationPreview() {

    const container =
        getElement(
            "previewCertifications"
        );

    if (!container) {
        return;
    }

    const items =
        $$(".certification-item");

    const validItems =
        items.filter(item => {

            return (
                normalizeText(
                    $(".certification-name", item)?.value
                ) ||
                normalizeText(
                    $(".certification-issuer", item)?.value
                ) ||
                normalizeText(
                    $(".certification-year", item)?.value
                )
            );
        });

    if (!validItems.length) {

        container.innerHTML = `
            <div class="preview-empty">
                Certifications will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const name =
                normalizeText(
                    $(".certification-name", item)?.value
                );

            const issuer =
                normalizeText(
                    $(".certification-issuer", item)?.value
                );

            const year =
                normalizeText(
                    $(".certification-year", item)?.value
                );

            return `
                <article class="preview-item">

                    ${
                        name
                            ? `<h4>${escapeHTML(name)}</h4>`
                            : ""
                    }

                    ${
                        issuer
                            ? `<strong>${escapeHTML(issuer)}</strong>`
                            : ""
                    }

                    ${
                        year
                            ? `<span class="preview-date">${escapeHTML(year)}</span>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   LANGUAGE PREVIEW
========================================================= */

function updateLanguagesPreview() {

    const container =
        getElement(
            "previewLanguages"
        );

    if (!container) {
        return;
    }

    const items =
        $$(".language-item");

    const validItems =
        items.filter(item => {

            return (
                normalizeText(
                    $(".language-name", item)?.value
                ) ||
                normalizeText(
                    $(".language-level", item)?.value
                )
            );
        });

    if (!validItems.length) {

        container.innerHTML = `
            <div class="preview-empty">
                Languages will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const name =
                normalizeText(
                    $(".language-name", item)?.value
                );

            const level =
                normalizeText(
                    $(".language-level", item)?.value
                );

            return `
                <article class="preview-item language-preview-item">

                    ${
                        name
                            ? `<strong>${escapeHTML(name)}</strong>`
                            : ""
                    }

                    ${
                        level
                            ? `<span>${escapeHTML(level)}</span>`
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   DATE HELPERS
========================================================= */

function formatMonth(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(
            `${value}-01T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            year: "numeric"
        }
    );
}


function buildDateRange(
    start,
    end
) {

    if (start && end) {
        return `${start} – ${end}`;
    }

    if (start) {
        return `${start} – Present`;
    }

    if (end) {
        return end;
    }

    return "";
}


/* =========================================================
   SKILL PARSER
========================================================= */

function parseCommaSeparated(value) {

    return value
        .split(/[,;\n]+/)
        .map(item => normalizeText(item))
        .filter(Boolean)
        .filter(
            (item, index, array) =>
                array.indexOf(item) === index
        );
}


/* =========================================================
   TEMPLATE SYSTEM
========================================================= */

function openTemplates() {

    const modal =
        getElement("templateModal");

    if (!modal) {
        return;
    }

    modal.style.display =
        "flex";

    document.body.classList.add(
        "modal-open"
    );
}


function closeTemplates() {

    const modal =
        getElement("templateModal");

    if (!modal) {
        return;
    }

    modal.style.display =
        "none";

    document.body.classList.remove(
        "modal-open"
    );
}


function changeTemplate(templateNumber) {

    const number =
        Number(templateNumber);

    if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 4
    ) {
        return;
    }

    currentTemplate =
        number;

    updateTemplateClass();

    closeTemplates();

    debounceSave();

    showToast(
        `Template ${number} selected.`
    );
}


function updateTemplateClass() {

    const preview =
        getElement("cvPreview");

    if (!preview) {
        return;
    }

    preview.classList.remove(
        "template-1",
        "template-2",
        "template-3",
        "template-4"
    );

    preview.classList.add(
        `template-${currentTemplate}`
    );
}


/* =========================================================
   ANALYSIS MODAL
========================================================= */

function openAnalysis() {

    const modal =
        getElement("analysisModal");

    if (!modal) {
        return;
    }

    modal.style.display =
        "flex";

    document.body.classList.add(
        "modal-open"
    );
}


function closeAnalysis() {

    const modal =
        getElement("analysisModal");

    if (!modal) {
        return;
    }

    modal.style.display =
        "none";

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupModalBehavior() {

    const templateModal =
        getElement("templateModal");

    const analysisModal =
        getElement("analysisModal");


    if (templateModal) {

        templateModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    templateModal
                ) {
                    closeTemplates();
                }
            }
        );
    }


    if (analysisModal) {

        analysisModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    analysisModal
                ) {
                    closeAnalysis();
                }
            }
        );
    }
}


function setupGlobalKeyboardEvents() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeTemplates();

            closeAnalysis();
        }
    );
}


/* =========================================================
   CLEAR CV
========================================================= */

function clearCV(event) {

    if (
        event &&
        typeof event.preventDefault ===
        "function"
    ) {
        event.preventDefault();
    }

    const confirmed =
        window.confirm(
            "Are you sure you want to clear your CV?"
        );

    if (!confirmed) {
        return;
    }

    isRestoringData = true;

    const basicFields = [
        "name",
        "email",
        "phone",
        "dateOfBirth",
        "address",
        "linkedin",
        "github",
        "jobTitle",
        "summary",
        "skills",
        "location",
        "careerField"
    ];

    basicFields.forEach(id => {

        const field =
            getElement(id);

        if (field) {
            field.value = "";
        }
    });


    const country =
        getElement("country");

    if (country) {
        country.value = "";
    }


    updateCityOptions("");


    const containers = [
        "experienceContainer",
        "educationContainer",
        "projectsContainer",
        "certificationsContainer",
        "languagesContainer"
    ];


    containers.forEach(id => {

        const container =
            getElement(id);

        if (!container) {
            return;
        }

        const items =
            $$(".repeatable-item", container);

        items.forEach(
            (item, index) => {

                if (index === 0) {

                    clearRepeatableItem(
                        item
                    );

                } else {

                    item.remove();
                }
            }
        );
    });


    currentPhotoData = "";

    const photoInput =
        getElement("profilePhoto");

    if (photoInput) {
        photoInput.value = "";
    }


    currentTemplate = 1;


    const careerRolesContainer =
        getElement("careerRoleOptions");

    if (careerRolesContainer) {

        careerRolesContainer.innerHTML = `
            <div class="career-role-placeholder">
                Select a career field to see recommended job roles.
            </div>
        `;
    }


    const guide =
        getElement("aiGuideContent");

    if (guide) {

        guide.textContent =
            "Select a career field to receive AI-powered career guidance.";
    }


    isRestoringData = false;


    updateCounters();

    updateAllPreviews();

    saveCVData();

    renderPhoto("");

    showToast(
        "Your CV has been cleared."
    );
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function collectCVData() {

    return {

        version: 1,

        personal: {

            name:
                getElement("name")?.value || "",

            email:
                getElement("email")?.value || "",

            phone:
                getElement("phone")?.value || "",

            dateOfBirth:
                getElement("dateOfBirth")?.value || "",

            country:
                getElement("country")?.value || "",

            city:
                getElement("city")?.value || "",

            location:
                getElement("location")?.value || "",

            address:
                getElement("address")?.value || "",

            linkedin:
                getElement("linkedin")?.value || "",

            github:
                getElement("github")?.value || ""
        },

        career: {

            field:
                getElement("careerField")?.value || "",

            jobTitle:
                getElement("jobTitle")?.value || ""
        },

        summary:
            getElement("summary")?.value || "",

        skills:
            getElement("skills")?.value || "",

        experience:
            collectExperience(),

        education:
            collectEducation(),

        projects:
            collectProjects(),

        certifications:
            collectCertifications(),

        languages:
            collectLanguages(),

        photo:
            currentPhotoData || "",

        template:
            currentTemplate
    };
}


function collectExperience() {

    return $$(".experience-item")
        .map(item => ({

            jobTitle:
                $(".experience-job-title", item)?.value || "",

            company:
                $(".experience-company", item)?.value || "",

            start:
                $(".experience-start", item)?.value || "",

            end:
                $(".experience-end", item)?.value || "",

            description:
                $(".experience-description", item)?.value || ""
        }));
}


function collectEducation() {

    return $$(".education-item")
        .map(item => ({

            degree:
                $(".education-degree", item)?.value || "",

            institution:
                $(".education-institution", item)?.value || "",

            start:
                $(".education-start", item)?.value || "",

            end:
                $(".education-end", item)?.value || "",

            details:
                $(".education-details", item)?.value || ""
        }));
}


function collectProjects() {

    return $$(".project-item")
        .map(item => ({

            name:
                $(".project-name", item)?.value || "",

            technologies:
                $(".project-technologies", item)?.value || "",

            description:
                $(".project-description", item)?.value || ""
        }));
}


function collectCertifications() {

    return $$(".certification-item")
        .map(item => ({

            name:
                $(".certification-name", item)?.value || "",

            issuer:
                $(".certification-issuer", item)?.value || "",

            year:
                $(".certification-year", item)?.value || ""
        }));
}


function collectLanguages() {

    return $$(".language-item")
        .map(item => ({

            name:
                $(".language-name", item)?.value || "",

            level:
                $(".language-level", item)?.value || ""
        }));
}


function saveCVData() {

    if (isRestoringData) {
        return;
    }

    try {

        const data =
            collectCVData();

        localStorage.setItem(
            APP_CONFIG.storageKey,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Unable to save CV data:",
            error
        );
    }
}


/* =========================================================
   RESTORE LOCAL DATA
========================================================= */

function restoreCVData() {

    try {

        const raw =
            localStorage.getItem(
                APP_CONFIG.storageKey
            );

        if (!raw) {
            return;
        }

        const data =
            JSON.parse(raw);

        if (!data || typeof data !== "object") {
            return;
        }

        isRestoringData = true;


        restorePersonalData(
            data.personal || {}
        );


        restoreCareerData(
            data.career || {}
        );


        const summary =
            getElement("summary");

        if (summary) {
            summary.value =
                data.summary || "";
        }


        const skills =
            getElement("skills");

        if (skills) {
            skills.value =
                data.skills || "";
        }


        restoreExperience(
            data.experience || []
        );

        restoreEducation(
            data.education || []
        );

        restoreProjects(
            data.projects || []
        );

        restoreCertifications(
            data.certifications || []
        );

        restoreLanguages(
            data.languages || []
        );


        currentPhotoData =
            data.photo || "";


        currentTemplate =
            Number(data.template) || 1;


        isRestoringData = false;


        updateAllPreviews();

        updateCounters();

        showToast(
            "Your saved CV has been restored."
        );

    } catch (error) {

        isRestoringData = false;

        console.warn(
            "Unable to restore CV data:",
            error
        );
    }
}


function restorePersonalData(data) {

    const fields = {

        name: data.name,

        email: data.email,

        phone: data.phone,

        dateOfBirth: data.dateOfBirth,

        address: data.address,

        linkedin: data.linkedin,

        github: data.github
    };


    Object.entries(fields)
        .forEach(
            ([id, value]) => {

                const field =
                    getElement(id);

                if (field) {
                    field.value =
                        value || "";
                }
            }
        );


    const country =
        getElement("country");

    if (country) {

        country.value =
            data.country || "";

        updateCityOptions(
            country.value,
            data.city || ""
        );
    }


    updateLocation();
}


function restoreCareerData(data) {

    const field =
        getElement("careerField");

    const title =
        getElement("jobTitle");

    if (field) {

        field.value =
            data.field || "";

        updateCareerRoles(
            field.value
        );

        updateCareerGuide(
            field.value
        );
    }

    if (title) {
        title.value =
            data.jobTitle || "";
    }
}


/* =========================================================
   RESTORE EXPERIENCE
========================================================= */

function restoreExperience(items) {

    const container =
        getElement("experienceContainer");

    if (!container) {
        return;
    }

    resetContainer(
        container,
        ".experience-item"
    );


    const first =
        $(".experience-item", container);

    if (items.length === 0) {

        clearRepeatableItem(first);

        return;
    }


    applyExperience(
        first,
        items[0]
    );


    items
        .slice(1)
        .forEach(itemData => {

            addExperience();

            const all =
                $$(".experience-item", container);

            applyExperience(
                all[all.length - 1],
                itemData
            );
        });
}


function applyExperience(
    item,
    data
) {

    if (!item || !data) {
        return;
    }

    const fields = {

        ".experience-job-title":
            data.jobTitle,

        ".experience-company":
            data.company,

        ".experience-start":
            data.start,

        ".experience-end":
            data.end,

        ".experience-description":
            data.description
    };


    Object.entries(fields)
        .forEach(
            ([selector, value]) => {

                const field =
                    $(selector, item);

                if (field) {
                    field.value =
                        value || "";
                }
            }
        );
}


/* =========================================================
   RESTORE EDUCATION
========================================================= */

function restoreEducation(items) {

    const container =
        getElement("educationContainer");

    if (!container) {
        return;
    }

    resetContainer(
        container,
        ".education-item"
    );


    const first =
        $(".education-item", container);

    if (!items.length) {

        clearRepeatableItem(first);

        return;
    }


    applyEducation(
        first,
        items[0]
    );


    items
        .slice(1)
        .forEach(itemData => {

            addEducation();

            const all =
                $$(".education-item", container);

            applyEducation(
                all[all.length - 1],
                itemData
            );
        });
}


function applyEducation(
    item,
    data
) {

    if (!item || !data) {
        return;
    }

    const fields = {

        ".education-degree":
            data.degree,

        ".education-institution":
            data.institution,

        ".education-start":
            data.start,

        ".education-end":
            data.end,

        ".education-details":
            data.details
    };


    Object.entries(fields)
        .forEach(
            ([selector, value]) => {

                const field =
                    $(selector, item);

                if (field) {
                    field.value =
                        value || "";
                }
            }
        );
}


/* =========================================================
   RESTORE PROJECTS
========================================================= */

function restoreProjects(items) {

    const container =
        getElement("projectsContainer");

    if (!container) {
        return;
    }

    resetContainer(
        container,
        ".project-item"
    );


    const first =
        $(".project-item", container);

    if (!items.length) {

        clearRepeatableItem(first);

        return;
    }


    applyProject(
        first,
        items[0]
    );


    items
        .slice(1)
        .forEach(itemData => {

            addProject();

            const all =
                $$(".project-item", container);

            applyProject(
                all[all.length - 1],
                itemData
            );
        });
}


function applyProject(
    item,
    data
) {

    if (!item || !data) {
        return;
    }

    const fields = {

        ".project-name":
            data.name,

        ".project-technologies":
            data.technologies,

        ".project-description":
            data.description
    };


    Object.entries(fields)
        .forEach(
            ([selector, value]) => {

                const field =
                    $(selector, item);

                if (field) {
                    field.value =
                        value || "";
                }
            }
        );
}


/* =========================================================
   RESTORE CERTIFICATIONS
========================================================= */

function restoreCertifications(items) {

    const container =
        getElement(
            "certificationsContainer"
        );

    if (!container) {
        return;
    }

    resetContainer(
        container,
        ".certification-item"
    );


    const first =
        $(".certification-item", container);

    if (!items.length) {

        clearRepeatableItem(first);

        return;
    }


    applyCertification(
        first,
        items[0]
    );


    items
        .slice(1)
        .forEach(itemData => {

            addCertification();

            const all =
                $$(".certification-item", container);

            applyCertification(
                all[all.length - 1],
                itemData
            );
        });
}


function applyCertification(
    item,
    data
) {

    if (!item || !data) {
        return;
    }

    const fields = {

        ".certification-name":
            data.name,

        ".certification-issuer":
            data.issuer,

        ".certification-year":
            data.year
    };


    Object.entries(fields)
        .forEach(
            ([selector, value]) => {

                const field =
                    $(selector, item);

                if (field) {
                    field.value =
                        value || "";
                }
            }
        );
}


/* =========================================================
   RESTORE LANGUAGES
========================================================= */

function restoreLanguages(items) {

    const container =
        getElement(
            "languagesContainer"
        );

    if (!container) {
        return;
    }

    resetContainer(
        container,
        ".language-item"
    );


    const first =
        $(".language-item", container);

    if (!items.length) {

        clearRepeatableItem(first);

        return;
    }


    applyLanguage(
        first,
        items[0]
    );


    items
        .slice(1)
        .forEach(itemData => {

            addLanguage();

            const all =
                $$(".language-item", container);

            applyLanguage(
                all[all.length - 1],
                itemData
            );
        });
}


function applyLanguage(
    item,
    data
) {

    if (!item || !data) {
        return;
    }

    const name =
        $(".language-name", item);

    const level =
        $(".language-level", item);

    if (name) {
        name.value =
            data.name || "";
    }

    if (level) {
        level.value =
            data.level || "";
    }
}


/* =========================================================
   RESET CONTAINER
========================================================= */

function resetContainer(
    container,
    selector
) {

    const items =
        $$(selector, container);

    items.forEach(
        (item, index) => {

            if (index > 0) {
                item.remove();
            }
        }
    );
}


/* =========================================================
   AI API HELPER
========================================================= */

async function callAI(
    endpoint,
    payload
) {

    const response =
        await fetch(
            `${APP_CONFIG.apiBase}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


    let data = null;

    try {
        data =
            await response.json();
    } catch {
        data = null;
    }


    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}.`;

        throw new Error(message);
    }


    return data;
}


/* =========================================================
   AI RESPONSE TEXT EXTRACTOR
========================================================= */

function extractAIText(data) {

    if (!data) {
        return "";
    }

    if (typeof data === "string") {
        return data;
    }

    return (
        data.text ||
        data.result ||
        data.content ||
        data.summary ||
        data.message ||
        ""
    );
}


/* =========================================================
   GENERATE SUMMARY WITH AI
========================================================= */

async function generateSummary() {

    const button =
        event?.currentTarget ||
        document.querySelector(
            ".ai-button"
        );

    const summary =
        getElement("summary");

    if (!summary) {
        return;
    }


    const data =
        collectCVData();


    if (
        !data.personal.name &&
        !data.career.jobTitle &&
        !data.career.field
    ) {

        showToast(
            "Enter your name or professional title first.",
            "warning"
        );

        return;
    }


    try {

        setButtonLoading(
            button,
            true,
            "Generating..."
        );


        const result =
            await callAI(
                "/generate-summary",
                {
                    name:
                        data.personal.name,

                    careerField:
                        data.career.field,

                    jobTitle:
                        data.career.jobTitle,

                    skills:
                        data.skills,

                    experience:
                        data.experience,

                    education:
                        data.education,

                    projects:
                        data.projects
                }
            );


        const text =
            extractAIText(result);


        if (!text) {
            throw new Error(
                "AI returned an empty response."
            );
        }


        summary.value =
            text.trim();

        updateAllPreviews();

        debounceSave();

        showToast(
            "Professional summary generated."
        );

    } catch (error) {

        console.error(
            "Generate summary error:",
            error
        );

        showToast(
            "AI backend is not connected yet. Your frontend is working correctly.",
            "warning"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );
    }
}


// ======================================================
// AI SUGGEST SKILLS
// ======================================================

async function suggestSkills() {
    const button =
        event?.currentTarget;

    const skills =
        getElement("skills");

    if (!skills) {
        return;
    }

    const data =
        collectCVData();

    if (
        !data.career.field &&
        !data.career.jobTitle
    ) {
        showToast(
            "Select a career field or enter a job title first.",
            "warning"
        );
        return;
    }

    try {
        setButtonLoading(
            button,
            true,
            "Suggesting..."
        );

        const result =
            await callAI(
                "/suggest-skills",
                {
                    // Backend expects "title"
                    title:
                        data.career.jobTitle ||
                        data.career.field,

                    existingSkills:
                        data.skills,

                    experience:
                        data.experience,

                    education:
                        data.education
                }
            );

        const text =
            extractAIText(result) ||
            result?.skills ||
            "";

        if (!text) {
            throw new Error(
                "AI returned no skills."
            );
        }

        skills.value =
            mergeSkills(
                skills.value,
                text
            );

        updateAllPreviews();
        debounceSave();

        showToast(
            "AI skills added."
        );

    } catch (error) {

        console.error(
            "Suggest skills error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to suggest skills with AI.",
            "warning"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );
    }
}

// ======================================================
// AI IMPROVE EXPERIENCE
// ======================================================

async function improveExperience(button) {
    const item =
        button?.closest(
            ".experience-item"
        );

    if (!item) {
        return;
    }

    const description =
        $(".experience-description", item);

    if (!description) {
        return;
    }

    if (
        !normalizeText(
            description.value
        )
    ) {
        showToast(
            "Write some experience details first.",
            "warning"
        );

        description.focus();
        return;
    }

    try {
        setButtonLoading(
            button,
            true,
            "Improving..."
        );

        const result =
            await callAI(
                "/improve-experience",
                {
                    jobTitle:
                        $(".experience-job-title", item)?.value || "",

                    company:
                        $(".experience-company", item)?.value || "",

                    // Backend expects "experience"
                    experience:
                        description.value,

                    careerField:
                        getElement("careerField")?.value || ""
                }
            );

        const text =
            extractAIText(result) ||
            result?.experience ||
            "";

        if (!text) {
            throw new Error(
                "AI returned empty experience."
            );
        }

        description.value =
            text.trim();

        updateAllPreviews();
        debounceSave();

        showToast(
            "Experience improved with AI."
        );

    } catch (error) {

        console.error(
            "Improve experience error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to improve experience with AI.",
            "warning"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );
    }
}

// ======================================================
// AI IMPROVE PROJECT
// ======================================================

async function improveProject(button) {
    const item =
        button?.closest(
            ".project-item"
        );

    if (!item) {
        return;
    }

    const description =
        $(".project-description", item);

    if (!description) {
        return;
    }

    if (
        !normalizeText(
            description.value
        )
    ) {
        showToast(
            "Write your project description first.",
            "warning"
        );

        description.focus();
        return;
    }

    try {
        setButtonLoading(
            button,
            true,
            "Improving..."
        );

        const result =
            await callAI(
                "/improve-project",
                {
                    projectName:
                        $(".project-name", item)?.value || "",

                    // Backend expects "projectDescription"
                    projectDescription:
                        description.value,

                    technologies:
                        $(".project-technologies", item)?.value || ""
                }
            );

        const text =
            extractAIText(result) ||
            result?.project ||
            "";

        if (!text) {
            throw new Error(
                "AI returned empty project description."
            );
        }

        description.value =
            text.trim();

        updateAllPreviews();
        debounceSave();

        showToast(
            "Project description improved."
        );

    } catch (error) {

        console.error(
            "Improve project error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to improve project with AI.",
            "warning"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );
    }
}

// ======================================================
// AI ANALYZE CV
// ======================================================

async function analyzeCV() {
    const button =
        event?.currentTarget;

    const analysisContent =
        getElement(
            "analysisContent"
        );

    if (!analysisContent) {
        return;
    }

    const data =
        collectCVData();

    const localAnalysis =
        createLocalCVAnalysis(
            data
        );

    openAnalysis();

    analysisContent.innerHTML = `
        <div class="analysis-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Analyzing your CV...
        </div>
    `;

    try {

        if (button) {
            setButtonLoading(
                button,
                true,
                "Analyzing..."
            );
        }

        const result =
            await callAI(
                "/analyze-cv",
                {
                    // Backend expects "cvText"
                    cvText:
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                }
            );

        const text =
            extractAIText(result) ||
            result?.analysis ||
            "";

        if (!text) {
            throw new Error(
                "AI returned no analysis."
            );
        }

        analysisContent.innerHTML = `
            <div class="ai-analysis-result">
                ${formatAIResponse(text)}
            </div>
        `;

    } catch (error) {

        console.warn(
            "AI analysis unavailable:",
            error
        );

        /*
            Frontend fallback.
            If AI is unavailable,
            local CV analysis will still appear.
        */
        analysisContent.innerHTML =
            localAnalysis;

    } finally {

        if (button) {
            setButtonLoading(
                button,
                false
            );
        }
    }
}

/* =========================================================
   LOCAL CV ANALYSIS FALLBACK
========================================================= */

function createLocalCVAnalysis(data) {

    let score = 0;

    const checks = [];


    if (data.personal.name) {

        score += 10;

        checks.push(
            createCheck(
                true,
                "Full name is provided."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add your full name."
            )
        );
    }


    if (data.personal.email) {

        score += 10;

        checks.push(
            createCheck(
                true,
                "Email address is provided."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add a professional email address."
            )
        );
    }


    if (data.personal.phone) {

        score += 5;

        checks.push(
            createCheck(
                true,
                "Phone number is included."
            )
        );
    }


    if (data.career.jobTitle) {

        score += 10;

        checks.push(
            createCheck(
                true,
                "Professional title is defined."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add a professional job title."
            )
        );
    }


    if (
        data.summary &&
        data.summary.length >= 50
    ) {

        score += 15;

        checks.push(
            createCheck(
                true,
                "Professional summary has useful detail."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add a stronger professional summary."
            )
        );
    }


    const skillCount =
        parseCommaSeparated(
            data.skills
        ).length;


    if (skillCount >= 5) {

        score += 15;

        checks.push(
            createCheck(
                true,
                `${skillCount} skills detected.`
            )
        );

    } else {

        score +=
            skillCount * 2;

        checks.push(
            createCheck(
                false,
                "Add at least 5 relevant skills."
            )
        );
    }


    if (
        data.experience.some(
            item =>
                item.jobTitle ||
                item.company ||
                item.description
        )
    ) {

        score += 15;

        checks.push(
            createCheck(
                true,
                "Work experience section contains information."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add relevant work experience if applicable."
            )
        );
    }


    if (
        data.education.some(
            item =>
                item.degree ||
                item.institution
        )
    ) {

        score += 10;

        checks.push(
            createCheck(
                true,
                "Education section is present."
            )
        );

    } else {

        checks.push(
            createCheck(
                false,
                "Add your education details."
            )
        );
    }


    if (
        data.projects.some(
            item =>
                item.name ||
                item.description
        )
    ) {

        score += 5;

        checks.push(
            createCheck(
                true,
                "Project information is included."
            )
        );
    }


    score =
        Math.min(
            100,
            Math.round(score)
        );


    return `
        <div class="local-analysis">

            <div class="analysis-score">
                <strong>${score}%</strong>
                <span>Frontend CV Readiness</span>
            </div>

            <div class="analysis-checks">
                ${checks.join("")}
            </div>

            <div class="analysis-note">
                <i class="fa-solid fa-circle-info"></i>
                This is a frontend fallback analysis.
                Once your backend is connected, the AI analysis
                endpoint will provide deeper recommendations.
            </div>

        </div>
    `;
}


function createCheck(
    passed,
    text
) {

    return `
        <div class="analysis-check">

            <i class="fa-solid ${
                passed
                    ? "fa-circle-check"
                    : "fa-circle-exclamation"
            }"></i>

            <span>
                ${escapeHTML(text)}
            </span>

        </div>
    `;
}


/* =========================================================
   AI RESPONSE FORMATTER
========================================================= */

function formatAIResponse(text) {

    const escaped =
        escapeHTML(text);

    return escaped
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )
        .replace(
            /\n{2,}/g,
            "</p><p>"
        )
        .replace(
            /\n/g,
            "<br>"
        );
}


/* =========================================================
   PDF / DOWNLOAD
========================================================= */

async function downloadCV() {

    const button =
        event?.currentTarget;


    const preview =
        getElement("cvPreview");


    if (!preview) {

        showToast(
            "CV preview is not available.",
            "error"
        );

        return;
    }


    const name =
        normalizeText(
            getElement("name")?.value
        );


    try {

        if (button) {

            setButtonLoading(
                button,
                true,
                "Preparing..."
            );
        }


        /*
            Try html2pdf first.
            If it is not loaded, dynamically load it.
        */

        await ensureHtml2Pdf();


        if (
            typeof window.html2pdf ===
            "function"
        ) {

            const options = {

                margin: 0,

                filename:
                    name
                        ? `${sanitizeFileName(name)}-CV.pdf`
                        : APP_CONFIG.pdfFileName,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {

                    scale: 2,

                    useCORS: true,

                    backgroundColor:
                        "#ffffff",

                    logging: false
                },

                jsPDF: {

                    unit: "mm",

                    format: "a4",

                    orientation:
                        "portrait"
                },

                pagebreak: {

                    mode: [
                        "css",
                        "legacy"
                    ]
                }
            };


            await window
                .html2pdf()
                .set(options)
                .from(preview)
                .save();


            showToast(
                "Your CV PDF has been downloaded."
            );

        } else {

            printCV();
        }

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        showToast(
            "PDF generation failed. Opening print mode instead.",
            "warning"
        );


        setTimeout(
            printCV,
            500
        );

    } finally {

        if (button) {

            setButtonLoading(
                button,
                false
            );
        }
    }
}


/* =========================================================
   HTML2PDF LOADER
========================================================= */

let html2pdfPromise = null;


function ensureHtml2Pdf() {

    if (
        typeof window.html2pdf ===
        "function"
    ) {

        return Promise.resolve();
    }


    if (html2pdfPromise) {

        return html2pdfPromise;
    }


    html2pdfPromise =
        new Promise(
            (resolve, reject) => {

                const existing =
                    document.querySelector(
                        'script[data-html2pdf="true"]'
                    );


                if (existing) {

                    existing.addEventListener(
                        "load",
                        () => resolve()
                    );

                    existing.addEventListener(
                        "error",
                        () => reject(
                            new Error(
                                "html2pdf failed to load."
                            )
                        )
                    );

                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";


                script.async = true;

                script.dataset.html2pdf =
                    "true";


                script.onload =
                    () => resolve();


                script.onerror =
                    () => reject(
                        new Error(
                            "Unable to load PDF library."
                        )
                    );


                document.head.appendChild(
                    script
                );
            }
        );


    return html2pdfPromise;
}


/* =========================================================
   PRINT FALLBACK
========================================================= */

function printCV() {

    const preview =
        getElement("cvPreview");

    if (!preview) {
        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1200"
        );


    if (!printWindow) {

        showToast(
            "Please allow popups to print your CV.",
            "warning"
        );

        return;
    }


    const styles =
        Array.from(
            document.querySelectorAll(
                "link[rel='stylesheet'], style"
            )
        )
        .map(element => {

            if (
                element.tagName ===
                "LINK"
            ) {

                return `
                    <link
                        rel="stylesheet"
                        href="${element.href}"
                    >
                `;
            }

            return element.outerHTML;

        })
        .join("\n");


    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Professional CV
            </title>

            ${styles}

            <style>

                body {
                    margin: 0;
                    background: white;
                }

                .cv-preview {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 auto !important;
                    box-shadow: none !important;
                }

            </style>

        </head>

        <body>

            ${preview.outerHTML}

        </body>

        </html>
    `);


    printWindow.document.close();


    printWindow.onload =
        () => {

            setTimeout(
                () => {

                    printWindow.focus();

                    printWindow.print();

                },
                500
            );
        };
}


/* =========================================================
   FILE NAME SANITIZER
========================================================= */

function sanitizeFileName(value) {

    return String(value)
        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .slice(
            0,
            80
        ) || "Professional";
}


/* =========================================================
   GLOBAL CLICK PROTECTION
========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;

        if (!target) {
            return;
        }


        /*
            Prevent accidental submission
            behavior if any future button
            is added without type.
        */

        const button =
            target.closest("button");


        if (
            button &&
            button.type !== "button" &&
            button.type !== "submit" &&
            button.type !== "reset"
        ) {

            button.type =
                "button";
        }
    }
);


/* =========================================================
   EXPERIENCE / EDUCATION DATE VALIDATION
========================================================= */

document.addEventListener(
    "change",
    event => {

        const target =
            event.target;


        if (
            target?.classList.contains(
                "experience-end"
            )
        ) {

            const item =
                target.closest(
                    ".experience-item"
                );

            const start =
                $(".experience-start", item);

            if (
                start &&
                target.value &&
                start.value &&
                target.value < start.value
            ) {

                showToast(
                    "Experience end date cannot be before start date.",
                    "warning"
                );

                target.value = "";
            }
        }


        if (
            target?.classList.contains(
                "education-end"
            )
        ) {

            const item =
                target.closest(
                    ".education-item"
                );

            const start =
                $(".education-start", item);

            if (
                start &&
                target.value &&
                start.value &&
                Number(target.value) <
                Number(start.value)
            ) {

                showToast(
                    "Education end year cannot be before start year.",
                    "warning"
                );

                target.value = "";
            }
        }
    }
);


/* =========================================================
   PREVENT ENTER FROM ACCIDENTALLY
   SUBMITTING FUTURE FORMS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Enter"
        ) {
            return;
        }


        const target =
            event.target;


        if (
            target &&
            target.tagName ===
            "INPUT" &&
            target.type !== "textarea"
        ) {

            /*
                Don't block normal text inputs.
                Only prevent if a form is ever
                introduced around this builder.
            */

            const form =
                target.closest("form");

            if (form) {
                event.preventDefault();
            }
        }
    }
);


/* =========================================================
   UNSAVED DATA SAFETY
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {
            saveCVData();
        } catch {
            /* Ignore storage errors */
        }
    }
);


/* =========================================================
   DEBUG API
========================================================= */

window.AICVBuilder = {

    getData:
        collectCVData,

    save:
        saveCVData,

    clear:
        clearCV,

    updatePreview:
        updateAllPreviews,

    changeTemplate:
        changeTemplate,

    openTemplates:
        openTemplates,

    closeTemplates:
        closeTemplates,

    analyze:
        analyzeCV
};


/* =========================================================
   INITIAL GLOBAL FUNCTIONS
   Required by inline HTML onclick=""
========================================================= */

window.openTemplates =
    openTemplates;

window.closeTemplates =
    closeTemplates;

window.changeTemplate =
    changeTemplate;

window.downloadCV =
    downloadCV;

window.clearCV =
    clearCV;

window.analyzeCV =
    analyzeCV;

window.addExperience =
    addExperience;

window.addEducation =
    addEducation;

window.addProject =
    addProject;

window.addCertification =
    addCertification;

window.addLanguage =
    addLanguage;

window.suggestSkills =
    suggestSkills;

window.generateSummary =
    generateSummary;

window.improveExperience =
    improveExperience;

window.improveProject =
    improveProject;

window.suggestCareerRole =
    suggestCareerRole;

window.closeAnalysis =
    closeAnalysis;


/* =========================================================
   END OF AI CV BUILDER SCRIPT
========================================================= */