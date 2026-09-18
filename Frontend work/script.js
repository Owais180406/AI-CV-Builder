/* =========================================================
   AI CV BUILDER - COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:5000";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let selectedCareerField = "";
let selectedCareerRole = "";
let currentTemplate = 1;
let toastTimer = null;


/* =========================================================
   CAREER DATA
========================================================= */

const careerData = {

    Technology: {

        roles: [
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
            "UI/UX Designer"
        ],

        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Node.js",
            "Git",
            "GitHub",
            "REST APIs",
            "SQL",
            "Python"
        ]

    },


    Healthcare: {

        roles: [
            "Medical Officer",
            "Nurse",
            "Pharmacist",
            "Medical Assistant",
            "Lab Technician",
            "Healthcare Administrator",
            "Physiotherapist"
        ],

        skills: [
            "Patient Care",
            "Medical Documentation",
            "Clinical Skills",
            "Healthcare Management",
            "Communication",
            "Teamwork"
        ]

    },


    Engineering: {

        roles: [
            "Civil Engineer",
            "Mechanical Engineer",
            "Electrical Engineer",
            "Electronics Engineer",
            "Chemical Engineer",
            "Software Engineer"
        ],

        skills: [
            "AutoCAD",
            "Engineering Design",
            "Project Management",
            "Technical Drawing",
            "Problem Solving",
            "MATLAB"
        ]

    },


    Business: {

        roles: [
            "Business Analyst",
            "Business Development Executive",
            "Operations Manager",
            "Project Manager",
            "Business Consultant"
        ],

        skills: [
            "Business Analysis",
            "Project Management",
            "Communication",
            "Leadership",
            "Microsoft Office",
            "Problem Solving"
        ]

    },


    Finance: {

        roles: [
            "Financial Analyst",
            "Accountant",
            "Finance Executive",
            "Investment Analyst",
            "Banking Officer"
        ],

        skills: [
            "Financial Analysis",
            "Accounting",
            "Excel",
            "Financial Reporting",
            "Budgeting",
            "Data Analysis"
        ]

    },


    Marketing: {

        roles: [
            "Digital Marketing Specialist",
            "E-commerce Specialist",
            "SEO Specialist",
            "Social Media Manager",
            "Marketing Executive",
            "Content Strategist"
        ],

        skills: [
            "Digital Marketing",
            "SEO",
            "Social Media Marketing",
            "Content Marketing",
            "Google Analytics",
            "Copywriting"
        ]

    },


    Education: {

        roles: [
            "Teacher",
            "Lecturer",
            "Education Coordinator",
            "Academic Advisor",
            "Trainer"
        ],

        skills: [
            "Teaching",
            "Lesson Planning",
            "Communication",
            "Classroom Management",
            "Research",
            "Presentation"
        ]

    },


    Design: {

        roles: [
            "Graphic Designer",
            "UI/UX Designer",
            "Web Designer",
            "Product Designer",
            "Visual Designer"
        ],

        skills: [
            "Figma",
            "Adobe Photoshop",
            "Adobe Illustrator",
            "UI Design",
            "UX Design",
            "Typography"
        ]

    },


    Legal: {

        roles: [
            "Lawyer",
            "Legal Assistant",
            "Legal Advisor",
            "Corporate Lawyer",
            "Legal Researcher"
        ],

        skills: [
            "Legal Research",
            "Legal Writing",
            "Contract Review",
            "Communication",
            "Case Analysis"
        ]

    },


    Science: {

        roles: [
            "Research Scientist",
            "Laboratory Technician",
            "Biologist",
            "Chemist",
            "Research Assistant"
        ],

        skills: [
            "Research",
            "Data Analysis",
            "Laboratory Skills",
            "Scientific Writing",
            "Experimentation"
        ]

    },


    Hospitality: {

        roles: [
            "Hotel Manager",
            "Front Desk Officer",
            "Restaurant Manager",
            "Event Coordinator",
            "Guest Relations Officer"
        ],

        skills: [
            "Customer Service",
            "Hospitality Management",
            "Communication",
            "Event Management",
            "Teamwork"
        ]

    },


    Other: {

        roles: [
            "Professional",
            "Assistant",
            "Coordinator",
            "Executive",
            "Specialist"
        ],

        skills: [
            "Communication",
            "Teamwork",
            "Leadership",
            "Problem Solving",
            "Time Management"
        ]

    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setupCareerSearch();

    setupLivePreview();

    setupCountryCity();

    setupProfilePhoto();

    setupInputFormatting();

    updatePreview();

    updateProgress();

});


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   CAREER FIELD
========================================================= */

function setupCareerSearch() {

    const careerField = document.getElementById("careerField");

    if (!careerField) return;

    careerField.addEventListener("change", function () {

        selectCareerField(this.value);

    });


    if (careerField.value) {

        selectCareerField(careerField.value);

    } else {

        renderCareerRoles();

    }

}


/* =========================================================
   SELECT CAREER FIELD
========================================================= */

function selectCareerField(field) {

    selectedCareerField = field || "";

    selectedCareerRole = "";

    const jobTitle = document.getElementById("jobTitle");


    if (!field) {

        if (jobTitle) {

            jobTitle.value = "";

        }

        renderCareerRoles();

        updateCareerGuidance();

        updatePreview();

        updateProgress();

        return;

    }


    const data = careerData[field];

    if (!data) return;


    renderCareerRoles();

    updateCareerGuidance();

    updatePreview();

    updateProgress();

    showToast(`${field} selected.`, "success");

}


/* =========================================================
   RENDER CAREER ROLES
========================================================= */

function renderCareerRoles() {

    const container = document.getElementById("careerRoleOptions");

    if (!container) return;


    container.innerHTML = "";


    if (
        !selectedCareerField ||
        !careerData[selectedCareerField]
    ) {

        container.innerHTML = `

            <div class="career-role-placeholder">

                Select a career field to see
                recommended job roles.

            </div>

        `;

        return;

    }


    const roles =
        careerData[selectedCareerField].roles || [];


    if (!roles.length) {

        container.innerHTML = `

            <div class="career-role-placeholder">

                No role suggestions available
                for this field.

            </div>

        `;

        return;

    }


    roles.forEach(function (role) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "career-role-option";


        if (role === selectedCareerRole) {

            button.classList.add("active");

        }


        button.innerHTML = `

            <span>
                ${escapeHTML(role)}
            </span>

        `;


        button.addEventListener(
            "click",
            function () {

                selectCareerRole(role);

            }
        );


        container.appendChild(button);

    });

}


/* =========================================================
   SELECT CAREER ROLE
========================================================= */

function selectCareerRole(role) {

    selectedCareerRole = role || "";

    const jobTitle =
        document.getElementById("jobTitle");


    if (jobTitle) {

        jobTitle.value = role;

    }


    renderCareerRoles();

    updatePreview();

    updateProgress();


    showToast(
        `${role} selected as your job title.`,
        "success"
    );

}


/* =========================================================
   CLEAR CAREER FIELD
========================================================= */

function clearCareerField() {

    selectedCareerField = "";

    selectedCareerRole = "";


    const careerField =
        document.getElementById("careerField");


    const jobTitle =
        document.getElementById("jobTitle");


    if (careerField) {

        careerField.value = "";

    }


    if (jobTitle) {

        jobTitle.value = "";

    }


    renderCareerRoles();

    updateCareerGuidance();

}


/* =========================================================
   SUGGEST CAREER ROLE
========================================================= */

function suggestCareerRole() {

    if (
        !selectedCareerField ||
        !careerData[selectedCareerField]
    ) {

        showToast(
            "Please select a career field first.",
            "error"
        );

        return;

    }


    const roles =
        careerData[selectedCareerField].roles || [];


    if (!roles.length) {

        showToast(
            "No role suggestions available.",
            "error"
        );

        return;

    }


    const role =
        roles[
            Math.floor(
                Math.random() * roles.length
            )
        ];


    selectCareerRole(role);

}


/* =========================================================
   AI CAREER GUIDANCE
========================================================= */

function updateCareerGuidance() {

    const guide =
        document.getElementById("aiGuideContent");


    if (!guide) return;


    if (
        !selectedCareerField ||
        !careerData[selectedCareerField]
    ) {

        guide.textContent =
            "Select a career field to receive AI-powered career guidance.";

        return;

    }


    const data =
        careerData[selectedCareerField];


    guide.innerHTML = `

        <strong>
            ${escapeHTML(selectedCareerField)}
        </strong>

        is a great starting point for building
        your CV.

        <br><br>

        Recommended skills include:

        <strong>
            ${data.skills
                .slice(0, 5)
                .map(escapeHTML)
                .join(", ")}
        </strong>.

        <br><br>

        Choose one of the recommended roles above
        to automatically add it as your Job Title.

    `;

}


/* =========================================================
   LIVE PREVIEW SETUP
========================================================= */

function setupLivePreview() {

    const selectors = [

        "#name",
        "#email",
        "#phone",
        "#dateOfBirth",
        "#country",
        "#city",
        "#address",
        "#linkedin",
        "#github",
        "#jobTitle",
        "#summary",
        "#skills"

    ];


    selectors.forEach(function (selector) {

        const element =
            document.querySelector(selector);


        if (!element) return;


        element.addEventListener(
            "input",
            updatePreview
        );


        element.addEventListener(
            "change",
            updatePreview
        );

    });


    document.addEventListener(
        "input",
        function (event) {

            if (
                event.target.matches(
                    ".experience-job-title, " +
                    ".experience-company, " +
                    ".experience-start, " +
                    ".experience-end, " +
                    ".experience-description, " +
                    ".education-degree, " +
                    ".education-institution, " +
                    ".education-start, " +
                    ".education-end, " +
                    ".education-details, " +
                    ".project-name, " +
                    ".project-technologies, " +
                    ".project-description, " +
                    ".certification-name, " +
                    ".certification-issuer, " +
                    ".certification-year, " +
                    ".language-name"
                )
            ) {

                updatePreview();

                updateProgress();

            }

        }
    );


    document.addEventListener(
        "change",
        function (event) {

            if (
                event.target.matches(
                    ".language-level"
                )
            ) {

                updatePreview();

                updateProgress();

            }

        }
    );

}


/* =========================================================
   UPDATE LIVE PREVIEW
========================================================= */

function updatePreview() {

    updateBasicPreview();

    updateExperiencePreview();

    updateEducationPreview();

    updateSkillsPreview();

    updateProjectsPreview();

    updateCertificationsPreview();

    updateLanguagesPreview();

}


/* =========================================================
   BASIC INFORMATION PREVIEW
========================================================= */

function updateBasicPreview() {

    const name =
        getValue("name") ||
        "Your Name";


    const jobTitle =
        getValue("jobTitle") ||
        "Professional Title";


    const email =
        getValue("email") ||
        "email@example.com";


    const phone =
        getValue("phone") ||
        "+92 300 0000000";


    const country =
        getValue("country");


    const city =
        getValue("city");


    const address =
        getValue("address");


    const linkedin =
        getValue("linkedin");


    const github =
        getValue("github");


    setText(
        "previewName",
        name
    );


    setText(
        "previewJobTitle",
        jobTitle
    );


    setHTML(
        "previewEmail",
        `<i class="fa-solid fa-envelope"></i> ${escapeHTML(email)}`
    );


    setHTML(
        "previewPhone",
        `<i class="fa-solid fa-phone"></i> ${escapeHTML(phone)}`
    );


    let locationParts = [];


    if (address) {

        locationParts.push(address);

    }


    if (city) {

        locationParts.push(city);

    }


    if (country) {

        locationParts.push(country);

    }


    const location =
        locationParts.length
            ? locationParts.join(", ")
            : "Pakistan";


    setHTML(
        "previewLocation",
        `<i class="fa-solid fa-location-dot"></i> ${escapeHTML(location)}`
    );


    const linkedinElement =
        document.getElementById(
            "previewLinkedin"
        );


    if (linkedinElement) {

        if (linkedin) {

            linkedinElement.innerHTML = `

                <a
                    href="${escapeHTML(linkedin)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fa-brands fa-linkedin"></i>
                    LinkedIn
                </a>

            `;

        } else {

            linkedinElement.innerHTML =
                `<i class="fa-brands fa-linkedin"></i> LinkedIn`;

        }

    }


    const githubElement =
        document.getElementById(
            "previewGithub"
        );


    if (githubElement) {

        if (github) {

            githubElement.innerHTML = `

                <a
                    href="${escapeHTML(github)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fa-brands fa-github"></i>
                    GitHub
                </a>

            `;

        } else {

            githubElement.innerHTML =
                `<i class="fa-brands fa-github"></i> GitHub`;

        }

    }


    updateSummaryPreview();

}


/* =========================================================
   SUMMARY PREVIEW
========================================================= */

function updateSummaryPreview() {

    const summary =
        getValue("summary");


    const section =
        document.getElementById(
            "previewSummarySection"
        );


    const element =
        document.getElementById(
            "previewSummary"
        );


    if (!section || !element) return;


    if (summary.trim()) {

        section.style.display = "";

        element.textContent =
            summary.trim();

    } else {

        section.style.display = "";

        element.textContent =
            "Your professional summary will appear here.";

    }

}


/* =========================================================
   EXPERIENCE PREVIEW
========================================================= */

function updateExperiencePreview() {

    const container =
        document.getElementById(
            "previewExperience"
        );


    const section =
        document.getElementById(
            "previewExperienceSection"
        );


    if (!container || !section) return;


    const items =
        document.querySelectorAll(
            ".experience-item"
        );


    let html = "";


    items.forEach(function (item) {

        const title =
            getElementValue(
                item,
                ".experience-job-title"
            );


        const company =
            getElementValue(
                item,
                ".experience-company"
            );


        const start =
            getElementValue(
                item,
                ".experience-start"
            );


        const end =
            getElementValue(
                item,
                ".experience-end"
            );


        const description =
            getElementValue(
                item,
                ".experience-description"
            );


        if (
            !title &&
            !company &&
            !start &&
            !end &&
            !description
        ) {

            return;

        }


        let dates = "";


        if (start && end) {

            dates =
                `${formatMonth(start)} - ${formatMonth(end)}`;

        } else if (start) {

            dates =
                `${formatMonth(start)} - Present`;

        } else if (end) {

            dates =
                formatMonth(end);

        }


        let descriptionHTML = "";


        if (description) {

            descriptionHTML =
                formatBulletText(description);

        }


        html += `

            <div class="preview-item">

                <div class="preview-item-header">

                    <div>

                        <h4>
                            ${escapeHTML(title || "Job Title")}
                        </h4>

                        ${
                            company
                                ? `<span>${escapeHTML(company)}</span>`
                                : ""
                        }

                    </div>

                    ${
                        dates
                            ? `<small>${escapeHTML(dates)}</small>`
                            : ""
                    }

                </div>

                ${
                    descriptionHTML
                        ? `<div class="preview-description">
                            ${descriptionHTML}
                           </div>`
                        : ""
                }

            </div>

        `;

    });


    if (html) {

        container.innerHTML = html;

    } else {

        container.innerHTML = `

            <div class="preview-empty">
                Work experience will appear here.
            </div>

        `;

    }

}


/* =========================================================
   EDUCATION PREVIEW
========================================================= */

function updateEducationPreview() {

    const container =
        document.getElementById(
            "previewEducation"
        );


    if (!container) return;


    const items =
        document.querySelectorAll(
            ".education-item"
        );


    let html = "";


    items.forEach(function (item) {

        const degree =
            getElementValue(
                item,
                ".education-degree"
            );


        const institution =
            getElementValue(
                item,
                ".education-institution"
            );


        const start =
            getElementValue(
                item,
                ".education-start"
            );


        const end =
            getElementValue(
                item,
                ".education-end"
            );


        const details =
            getElementValue(
                item,
                ".education-details"
            );


        if (
            !degree &&
            !institution &&
            !start &&
            !end &&
            !details
        ) {

            return;

        }


        let years = "";


        if (start && end) {

            years =
                `${start} - ${end}`;

        } else if (start) {

            years =
                `${start} - Present`;

        } else if (end) {

            years = end;

        }


        html += `

            <div class="preview-item">

                <div class="preview-item-header">

                    <div>

                        <h4>
                            ${escapeHTML(
                                degree ||
                                "Degree / Qualification"
                            )}
                        </h4>

                        ${
                            institution
                                ? `<span>
                                    ${escapeHTML(institution)}
                                   </span>`
                                : ""
                        }

                    </div>

                    ${
                        years
                            ? `<small>
                                ${escapeHTML(years)}
                               </small>`
                            : ""
                    }

                </div>

                ${
                    details
                        ? `<p>
                            ${escapeHTML(details)}
                           </p>`
                        : ""
                }

            </div>

        `;

    });


    if (html) {

        container.innerHTML = html;

    } else {

        container.innerHTML = `

            <div class="preview-empty">
                Education will appear here.
            </div>

        `;

    }

}


/* =========================================================
   SKILLS PREVIEW
========================================================= */

function updateSkillsPreview() {

    const container =
        document.getElementById(
            "previewSkills"
        );


    if (!container) return;


    const skillsText =
        getValue("skills");


    const skills =
        parseList(skillsText);


    if (!skills.length) {

        container.innerHTML = `

            <span class="skill-placeholder">
                Skills will appear here.
            </span>

        `;

        return;

    }


    container.innerHTML =
        skills.map(function (skill) {

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
        document.getElementById(
            "previewProjects"
        );


    if (!container) return;


    const items =
        document.querySelectorAll(
            ".project-item"
        );


    let html = "";


    items.forEach(function (item) {

        const name =
            getElementValue(
                item,
                ".project-name"
            );


        const technologies =
            getElementValue(
                item,
                ".project-technologies"
            );


        const description =
            getElementValue(
                item,
                ".project-description"
            );


        if (
            !name &&
            !technologies &&
            !description
        ) {

            return;

        }


        html += `

            <div class="preview-item">

                <div class="preview-item-header">

                    <div>

                        <h4>
                            ${escapeHTML(
                                name ||
                                "Project"
                            )}
                        </h4>

                        ${
                            technologies
                                ? `<span>
                                    ${escapeHTML(
                                        technologies
                                    )}
                                   </span>`
                                : ""
                        }

                    </div>

                </div>

                ${
                    description
                        ? `<div class="preview-description">
                            ${formatBulletText(
                                description
                            )}
                           </div>`
                        : ""
                }

            </div>

        `;

    });


    if (html) {

        container.innerHTML = html;

    } else {

        container.innerHTML = `

            <div class="preview-empty">
                Projects will appear here.
            </div>

        `;

    }

}


/* =========================================================
   CERTIFICATIONS PREVIEW
========================================================= */

function updateCertificationsPreview() {

    const container =
        document.getElementById(
            "previewCertifications"
        );


    if (!container) return;


    const items =
        document.querySelectorAll(
            ".certification-item"
        );


    let html = "";


    items.forEach(function (item) {

        const name =
            getElementValue(
                item,
                ".certification-name"
            );


        const issuer =
            getElementValue(
                item,
                ".certification-issuer"
            );


        const year =
            getElementValue(
                item,
                ".certification-year"
            );


        if (
            !name &&
            !issuer &&
            !year
        ) {

            return;

        }


        html += `

            <div class="preview-item">

                <div class="preview-item-header">

                    <div>

                        <h4>
                            ${escapeHTML(
                                name ||
                                "Certification"
                            )}
                        </h4>

                        ${
                            issuer
                                ? `<span>
                                    ${escapeHTML(issuer)}
                                   </span>`
                                : ""
                        }

                    </div>

                    ${
                        year
                            ? `<small>
                                ${escapeHTML(year)}
                               </small>`
                            : ""
                    }

                </div>

            </div>

        `;

    });


    if (html) {

        container.innerHTML = html;

    } else {

        container.innerHTML = `

            <div class="preview-empty">
                Certifications will appear here.
            </div>

        `;

    }

}


/* =========================================================
   LANGUAGES PREVIEW
========================================================= */

function updateLanguagesPreview() {

    const container =
        document.getElementById(
            "previewLanguages"
        );


    if (!container) return;


    const items =
        document.querySelectorAll(
            ".language-item"
        );


    let html = "";


    items.forEach(function (item) {

        const name =
            getElementValue(
                item,
                ".language-name"
            );


        const level =
            getElementValue(
                item,
                ".language-level"
            );


        if (!name && !level) {

            return;

        }


        html += `

            <div class="preview-language">

                <span>
                    ${escapeHTML(
                        name ||
                        "Language"
                    )}
                </span>

                ${
                    level
                        ? `<strong>
                            ${escapeHTML(level)}
                           </strong>`
                        : ""
                }

            </div>

        `;

    });


    if (html) {

        container.innerHTML = html;

    } else {

        container.innerHTML = `

            <div class="preview-empty">
                Languages will appear here.
            </div>

        `;

    }

}


/* =========================================================
   COUNTRY + CITY
========================================================= */

function setupCountryCity() {

    const country =
        document.getElementById(
            "country"
        );


    const city =
        document.getElementById(
            "city"
        );


    if (!country || !city) return;


    const cities = {

        Pakistan: [
            "Karachi",
            "Lahore",
            "Islamabad",
            "Rawalpindi",
            "Faisalabad",
            "Multan",
            "Peshawar",
            "Quetta",
            "Hyderabad"
        ],

        India: [
            "Mumbai",
            "Delhi",
            "Bangalore",
            "Hyderabad",
            "Chennai",
            "Kolkata"
        ],

        "United Arab Emirates": [
            "Dubai",
            "Abu Dhabi",
            "Sharjah",
            "Ajman"
        ],

        "Saudi Arabia": [
            "Riyadh",
            "Jeddah",
            "Dammam",
            "Mecca",
            "Medina"
        ],

        "United Kingdom": [
            "London",
            "Manchester",
            "Birmingham",
            "Liverpool"
        ],

        "United States": [
            "New York",
            "Los Angeles",
            "Chicago",
            "Houston",
            "San Francisco"
        ],

        Canada: [
            "Toronto",
            "Vancouver",
            "Montreal",
            "Calgary"
        ],

        Australia: [
            "Sydney",
            "Melbourne",
            "Brisbane",
            "Perth"
        ],

        Germany: [
            "Berlin",
            "Munich",
            "Hamburg",
            "Frankfurt"
        ]

    };


    country.addEventListener(
        "change",
        function () {

            const selected =
                this.value;


            city.innerHTML = "";


            if (
                !selected ||
                !cities[selected]
            ) {

                city.disabled = true;


                city.innerHTML = `

                    <option value="">
                        Select country first
                    </option>

                `;

                updatePreview();

                return;

            }


            city.disabled = false;


            city.innerHTML = `

                <option value="">
                    Select City
                </option>

            `;


            cities[selected].forEach(
                function (cityName) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        cityName;


                    option.textContent =
                        cityName;


                    city.appendChild(option);

                }
            );


            updatePreview();

            updateProgress();

        }
    );

}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function setupProfilePhoto() {

    const input =
        document.getElementById(
            "profilePhoto"
        );


    const photoPreview =
        document.getElementById(
            "photoPreview"
        );


    const previewPhoto =
        document.getElementById(
            "previewPhoto"
        );


    const defaultIcon =
        document.getElementById(
            "defaultPhotoIcon"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) return;


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "Please select an image file.",
                    "error"
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const imageURL =
                        event.target.result;


                    if (photoPreview) {

                        photoPreview.innerHTML = `

                            <img
                                src="${imageURL}"
                                alt="Profile Photo"
                            >

                        `;

                    }


                    if (previewPhoto) {

                        previewPhoto.src =
                            imageURL;

                        previewPhoto.style.display =
                            "block";

                    }


                    if (defaultIcon) {

                        defaultIcon.style.display =
                            "none";

                    }


                    updateProgress();


                    showToast(
                        "Profile photo added.",
                        "success"
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   INPUT FORMATTING
========================================================= */

function setupInputFormatting() {

    const phone =
        document.getElementById(
            "phone"
        );


    if (phone) {

        phone.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(
                        /[^0-9+() -]/g,
                        ""
                    );

            }
        );

    }

}


/* =========================================================
   ADD EXPERIENCE
========================================================= */

function addExperience() {

    const container =
        document.getElementById(
            "experienceContainer"
        );


    if (!container) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "repeatable-item experience-item";


    item.innerHTML = `

        <div class="repeatable-item-header">

            <h3>
                Additional Experience
            </h3>

            <button
                type="button"
                class="remove-button"
                onclick="removeItem(this)"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        </div>


        <div class="form-grid">


            <div class="form-group">

                <label>
                    Job Title
                </label>

                <input
                    type="text"
                    class="experience-job-title"
                    placeholder="e.g. Frontend Developer"
                >

            </div>


            <div class="form-group">

                <label>
                    Company
                </label>

                <input
                    type="text"
                    class="experience-company"
                    placeholder="Company Name"
                >

            </div>


            <div class="form-group">

                <label>
                    Start Date
                </label>

                <input
                    type="month"
                    class="experience-start"
                >

            </div>


            <div class="form-group">

                <label>
                    End Date
                </label>

                <input
                    type="month"
                    class="experience-end"
                >

            </div>


            <div class="form-group full-width">

                <label>
                    Description
                </label>

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

    `;


    container.appendChild(item);


    updatePreview();

    updateProgress();

}


/* =========================================================
   ADD EDUCATION
========================================================= */

function addEducation() {

    const container =
        document.getElementById(
            "educationContainer"
        );


    if (!container) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "repeatable-item education-item";


    item.innerHTML = `

        <div class="repeatable-item-header">

            <h3>
                Additional Education
            </h3>

            <button
                type="button"
                class="remove-button"
                onclick="removeItem(this)"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        </div>


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

    `;


    container.appendChild(item);


    updatePreview();

    updateProgress();

}


/* =========================================================
   ADD PROJECT
========================================================= */

function addProject() {

    const container =
        document.getElementById(
            "projectsContainer"
        );


    if (!container) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "repeatable-item project-item";


    item.innerHTML = `

        <div class="repeatable-item-header">

            <h3>
                Additional Project
            </h3>

            <button
                type="button"
                class="remove-button"
                onclick="removeItem(this)"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        </div>


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

    `;


    container.appendChild(item);


    updatePreview();

    updateProgress();

}


/* =========================================================
   ADD CERTIFICATION
========================================================= */

function addCertification() {

    const container =
        document.getElementById(
            "certificationsContainer"
        );


    if (!container) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "repeatable-item certification-item";


    item.innerHTML = `

        <div class="repeatable-item-header">

            <h3>
                Additional Certification
            </h3>

            <button
                type="button"
                class="remove-button"
                onclick="removeItem(this)"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        </div>


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

    `;


    container.appendChild(item);


    updatePreview();

    updateProgress();

}


/* =========================================================
   ADD LANGUAGE
========================================================= */

function addLanguage() {

    const container =
        document.getElementById(
            "languagesContainer"
        );


    if (!container) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "repeatable-item language-item";


    item.innerHTML = `

        <div class="repeatable-item-header">

            <h3>
                Additional Language
            </h3>

            <button
                type="button"
                class="remove-button"
                onclick="removeItem(this)"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        </div>


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

    `;


    container.appendChild(item);


    updatePreview();

    updateProgress();

}


/* =========================================================
   REMOVE REPEATABLE ITEM
========================================================= */

function removeItem(button) {

    if (!button) return;


    const item =
        button.closest(
            ".repeatable-item"
        );


    if (!item) return;


    item.remove();


    updatePreview();

    updateProgress();

    showToast(
        "Item removed.",
        "success"
    );

}


/* =========================================================
   AI - GENERATE SUMMARY
========================================================= */

async function generateSummary() {

    const button =
        event?.currentTarget;


    const name =
        getValue("name");


    const jobTitle =
        getValue("jobTitle");


    const skills =
        getValue("skills");


    const education =
        collectEducationText();


    const experience =
        collectExperienceText();


    if (
        !name &&
        !jobTitle &&
        !skills &&
        !experience &&
        !education
    ) {

        showToast(
            "Please enter some CV information first.",
            "error"
        );

        return;

    }


    setButtonLoading(
        button,
        true,
        "Generating..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/generate-summary`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name,

                        jobTitle,

                        skills,

                        experience,

                        education

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to generate summary."
            );

        }


        const summary =
            document.getElementById(
                "summary"
            );


        if (summary) {

            summary.value =
                data.summary || "";

            updatePreview();

            updateProgress();

        }


        showToast(
            "Professional summary generated.",
            "success"
        );


    } catch (error) {

        console.error(error);


        showToast(
            getFriendlyAPIError(
                error
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Generate Summary with AI"
        );

    }

}


/* =========================================================
   AI - SUGGEST SKILLS
========================================================= */

async function suggestSkills() {

    const button =
        event?.currentTarget;


    const jobTitle =
        getValue("jobTitle");


    const existingSkills =
        getValue("skills");


    if (!jobTitle && !selectedCareerField) {

        showToast(
            "Please select a career field or enter a job title first.",
            "error"
        );

        return;

    }


    const finalJobTitle =
        jobTitle ||
        selectedCareerRole ||
        selectedCareerField;


    setButtonLoading(
        button,
        true,
        "Generating..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/suggest-skills`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        jobTitle:
                            finalJobTitle,

                        existingSkills

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to generate skills."
            );

        }


        const newSkills =
            Array.isArray(data.skills)
                ? data.skills
                : [];


        const existing =
            parseList(existingSkills);


        const merged = [
            ...existing
        ];


        newSkills.forEach(function (skill) {

            const clean =
                String(skill).trim();


            if (
                clean &&
                !merged.some(
                    existingSkill =>
                        existingSkill.toLowerCase() ===
                        clean.toLowerCase()
                )
            ) {

                merged.push(clean);

            }

        });


        const skillsInput =
            document.getElementById(
                "skills"
            );


        if (skillsInput) {

            skillsInput.value =
                merged.join(", ");

            updatePreview();

            updateProgress();

        }


        showToast(
            "AI skills suggestions added.",
            "success"
        );


    } catch (error) {

        console.error(error);


        showToast(
            getFriendlyAPIError(
                error
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Suggest Skills with AI"
        );

    }

}


/* =========================================================
   AI - IMPROVE EXPERIENCE
========================================================= */

async function improveExperience(button) {

    const item =
        button?.closest(
            ".experience-item"
        );


    if (!item) return;


    const jobTitle =
        getElementValue(
            item,
            ".experience-job-title"
        );


    const company =
        getElementValue(
            item,
            ".experience-company"
        );


    const description =
        getElementValue(
            item,
            ".experience-description"
        );


    if (!description.trim()) {

        showToast(
            "Please write an experience description first.",
            "error"
        );

        return;

    }


    setButtonLoading(
        button,
        true,
        "Improving..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/improve-experience`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        jobTitle,

                        company,

                        description

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to improve experience."
            );

        }


        const descriptionInput =
            item.querySelector(
                ".experience-description"
            );


        if (descriptionInput) {

            descriptionInput.value =
                data.experience || "";

            updatePreview();

        }


        showToast(
            "Experience improved with AI.",
            "success"
        );


    } catch (error) {

        console.error(error);


        showToast(
            getFriendlyAPIError(
                error
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Improve with AI"
        );

    }

}


/* =========================================================
   AI - IMPROVE PROJECT
========================================================= */

async function improveProject(button) {

    const item =
        button?.closest(
            ".project-item"
        );


    if (!item) return;


    const projectName =
        getElementValue(
            item,
            ".project-name"
        );


    const technologies =
        getElementValue(
            item,
            ".project-technologies"
        );


    const description =
        getElementValue(
            item,
            ".project-description"
        );


    if (!description.trim()) {

        showToast(
            "Please write a project description first.",
            "error"
        );

        return;

    }


    setButtonLoading(
        button,
        true,
        "Improving..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/improve-project`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        projectName,

                        technologies,

                        description

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to improve project."
            );

        }


        const descriptionInput =
            item.querySelector(
                ".project-description"
            );


        if (descriptionInput) {

            descriptionInput.value =
                data.description || "";

            updatePreview();

        }


        showToast(
            "Project improved with AI.",
            "success"
        );


    } catch (error) {

        console.error(error);


        showToast(
            getFriendlyAPIError(
                error
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Improve with AI"
        );

    }

}


/* =========================================================
   AI - ANALYZE CV
========================================================= */

async function analyzeCV() {

    const modal =
        document.getElementById(
            "analysisModal"
        );


    const content =
        document.getElementById(
            "analysisContent"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }


    if (content) {

        content.innerHTML = `

            <div class="analysis-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <p>
                    AI is analyzing your CV...
                </p>

            </div>

        `;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/analyze-cv`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            getValue("name"),

                        jobTitle:
                            getValue("jobTitle"),

                        summary:
                            getValue("summary"),

                        skills:
                            getValue("skills"),

                        experience:
                            collectExperienceText(),

                        education:
                            collectEducationText(),

                        projects:
                            collectProjectsText(),

                        certifications:
                            collectCertificationsText()

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to analyze CV."
            );

        }


        if (content) {

            content.innerHTML =
                formatAIText(
                    data.analysis
                );

        }


    } catch (error) {

        console.error(error);


        if (content) {

            content.innerHTML = `

                <div class="analysis-error">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <p>
                        ${escapeHTML(
                            getFriendlyAPIError(
                                error
                            )
                        )}
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   TEMPLATES
========================================================= */

function openTemplates() {

    const modal =
        document.getElementById(
            "templateModal"
        );


    if (!modal) return;


    modal.style.display =
        "flex";

}


function closeTemplates() {

    const modal =
        document.getElementById(
            "templateModal"
        );


    if (!modal) return;


    modal.style.display =
        "none";

}


function changeTemplate(templateNumber) {

    const cv =
        document.getElementById(
            "cvPreview"
        );


    if (!cv) return;


    currentTemplate =
        Number(templateNumber) || 1;


    cv.classList.remove(
        "template-1",
        "template-2",
        "template-3",
        "template-4"
    );


    cv.classList.add(
        `template-${currentTemplate}`
    );


    closeTemplates();


    showToast(
        `Template ${currentTemplate} selected.`,
        "success"
    );

}


/* =========================================================
   CLOSE ANALYSIS
========================================================= */

function closeAnalysis() {

    const modal =
        document.getElementById(
            "analysisModal"
        );


    if (!modal) return;


    modal.style.display =
        "none";

}


/* =========================================================
   CLEAR CV
========================================================= */

function clearCV() {

    const confirmed =
        confirm(
            "Are you sure you want to clear your entire CV?"
        );


    if (!confirmed) return;


    const fields =
        document.querySelectorAll(
            "input, textarea, select"
        );


    fields.forEach(function (field) {

        if (
            field.type === "file"
        ) {

            field.value = "";

        } else if (
            field.id !== "city"
        ) {

            field.value = "";

        }

    });


    const city =
        document.getElementById(
            "city"
        );


    if (city) {

        city.disabled = true;

        city.innerHTML = `

            <option value="">
                Select country first
            </option>

        `;

    }


    const photoPreview =
        document.getElementById(
            "photoPreview"
        );


    if (photoPreview) {

        photoPreview.innerHTML = `

            <i class="fa-solid fa-user"></i>

        `;

    }


    const previewPhoto =
        document.getElementById(
            "previewPhoto"
        );


    const defaultPhotoIcon =
        document.getElementById(
            "defaultPhotoIcon"
        );


    if (previewPhoto) {

        previewPhoto.src = "";

        previewPhoto.style.display =
            "none";

    }


    if (defaultPhotoIcon) {

        defaultPhotoIcon.style.display =
            "block";

    }


    selectedCareerField = "";

    selectedCareerRole = "";


    renderCareerRoles();

    updateCareerGuidance();

    updatePreview();

    updateProgress();


    showToast(
        "Your CV has been cleared.",
        "success"
    );

}


/* =========================================================
   DOWNLOAD CV
========================================================= */

function downloadCV() {

    const cv =
        document.getElementById(
            "cvPreview"
        );


    if (!cv) {

        showToast(
            "CV preview not found.",
            "error"
        );

        return;

    }


    updatePreview();


    window.print();

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress() {

    const fields = [

        getValue("name"),

        getValue("email"),

        getValue("phone"),

        getValue("jobTitle"),

        getValue("summary"),

        getValue("skills"),

        getValue("country"),

        getValue("city")

    ];


    let completed =
        fields.filter(
            value =>
                String(value).trim() !== ""
        ).length;


    if (
        document.querySelector(
            ".experience-description"
        )?.value.trim()
    ) {

        completed++;

    }


    if (
        document.querySelector(
            ".education-degree"
        )?.value.trim()
    ) {

        completed++;

    }


    if (
        document.querySelector(
            ".project-description"
        )?.value.trim()
    ) {

        completed++;

    }


    const percentage =
        Math.round(
            (
                completed /
                11
            ) * 100
        );


    document
        .querySelectorAll(
            "[data-progress]"
        )
        .forEach(
            function (element) {

                element.style.width =
                    `${Math.min(
                        percentage,
                        100
                    )}%`;

            }
        );

}


/* =========================================================
   COLLECT EXPERIENCE
========================================================= */

function collectExperienceText() {

    const items =
        document.querySelectorAll(
            ".experience-item"
        );


    const data = [];


    items.forEach(function (item) {

        const title =
            getElementValue(
                item,
                ".experience-job-title"
            );


        const company =
            getElementValue(
                item,
                ".experience-company"
            );


        const start =
            getElementValue(
                item,
                ".experience-start"
            );


        const end =
            getElementValue(
                item,
                ".experience-end"
            );


        const description =
            getElementValue(
                item,
                ".experience-description"
            );


        if (
            title ||
            company ||
            start ||
            end ||
            description
        ) {

            data.push(
                [
                    title,
                    company,
                    start,
                    end,
                    description
                ]
                .filter(Boolean)
                .join(" | ")
            );

        }

    });


    return data.join("\n");

}


/* =========================================================
   COLLECT EDUCATION
========================================================= */

function collectEducationText() {

    const items =
        document.querySelectorAll(
            ".education-item"
        );


    const data = [];


    items.forEach(function (item) {

        const degree =
            getElementValue(
                item,
                ".education-degree"
            );


        const institution =
            getElementValue(
                item,
                ".education-institution"
            );


        const start =
            getElementValue(
                item,
                ".education-start"
            );


        const end =
            getElementValue(
                item,
                ".education-end"
            );


        const details =
            getElementValue(
                item,
                ".education-details"
            );


        if (
            degree ||
            institution ||
            start ||
            end ||
            details
        ) {

            data.push(
                [
                    degree,
                    institution,
                    start,
                    end,
                    details
                ]
                .filter(Boolean)
                .join(" | ")
            );

        }

    });


    return data.join("\n");

}


/* =========================================================
   COLLECT PROJECTS
========================================================= */

function collectProjectsText() {

    const items =
        document.querySelectorAll(
            ".project-item"
        );


    const data = [];


    items.forEach(function (item) {

        const name =
            getElementValue(
                item,
                ".project-name"
            );


        const technologies =
            getElementValue(
                item,
                ".project-technologies"
            );


        const description =
            getElementValue(
                item,
                ".project-description"
            );


        if (
            name ||
            technologies ||
            description
        ) {

            data.push(
                [
                    name,
                    technologies,
                    description
                ]
                .filter(Boolean)
                .join(" | ")
            );

        }

    });


    return data.join("\n");

}


/* =========================================================
   COLLECT CERTIFICATIONS
========================================================= */

function collectCertificationsText() {

    const items =
        document.querySelectorAll(
            ".certification-item"
        );


    const data = [];


    items.forEach(function (item) {

        const name =
            getElementValue(
                item,
                ".certification-name"
            );


        const issuer =
            getElementValue(
                item,
                ".certification-issuer"
            );


        const year =
            getElementValue(
                item,
                ".certification-year"
            );


        if (
            name ||
            issuer ||
            year
        ) {

            data.push(
                [
                    name,
                    issuer,
                    year
                ]
                .filter(Boolean)
                .join(" | ")
            );

        }

    });


    return data.join("\n");

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) return "";


    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   GET ELEMENT VALUE
========================================================= */

function getElementValue(
    parent,
    selector
) {

    if (!parent) return "";


    const element =
        parent.querySelector(
            selector
        );


    if (!element) return "";


    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.textContent =
        value;

}


/* =========================================================
   SET HTML
========================================================= */

function setHTML(id, html) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.innerHTML =
        html;

}


/* =========================================================
   PARSE LIST
========================================================= */

function parseList(value) {

    return String(value || "")

        .split(
            /[,;\n]+/
        )

        .map(
            item =>
                item.trim()
        )

        .filter(Boolean);

}


/* =========================================================
   FORMAT MONTH
========================================================= */

function formatMonth(value) {

    if (!value) return "";


    const parts =
        value.split("-");


    if (parts.length !== 2) {

        return value;

    }


    const year =
        parts[0];


    const month =
        Number(parts[1]);


    const monthNames = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ];


    return `${monthNames[month - 1]} ${year}`;

}


/* =========================================================
   FORMAT BULLET TEXT
========================================================= */

function formatBulletText(text) {

    const lines =
        String(text || "")
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);


    if (!lines.length) return "";


    if (lines.length === 1) {

        return `
            <p>
                ${escapeHTML(lines[0])}
            </p>
        `;

    }


    return `

        <ul>

            ${lines.map(
                line => `

                    <li>
                        ${escapeHTML(
                            line
                                .replace(
                                    /^[-•*]\s*/,
                                    ""
                                )
                        )}
                    </li>

                `
            ).join("")}

        </ul>

    `;

}


/* =========================================================
   FORMAT AI TEXT
========================================================= */

function formatAIText(text) {

    if (!text) {

        return `
            <p>
                No analysis was returned.
            </p>
        `;

    }


    const escaped =
        escapeHTML(text);


    const lines =
        escaped
            .split("\n");


    let html = "";


    lines.forEach(function (line) {

        const trimmed =
            line.trim();


        if (!trimmed) {

            html += "<br>";

            return;

        }


        if (
            /^#{1,6}\s/.test(
                trimmed
            )
        ) {

            html += `

                <h3>
                    ${trimmed.replace(
                        /^#{1,6}\s/,
                        ""
                    )}
                </h3>

            `;

            return;

        }


        if (
            /^\d+\.\s/.test(
                trimmed
            )
        ) {

            html += `

                <p class="analysis-point">

                    ${trimmed}

                </p>

            `;

            return;

        }


        if (
            /^[-•*]\s/.test(
                trimmed
            )
        ) {

            html += `

                <p class="analysis-bullet">

                    ${trimmed}

                </p>

            `;

            return;

        }


        html += `

            <p>
                ${trimmed}
            </p>

        `;

    });


    return html;

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button) return;


    if (loading) {

        button.disabled = true;


        button.dataset.originalHTML =
            button.innerHTML;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            ${escapeHTML(text)}

        `;

    } else {

        button.disabled = false;


        if (
            button.dataset.originalHTML
        ) {

            button.innerHTML =
                button.dataset.originalHTML;

        } else {

            button.innerHTML = `

                <i class="fa-solid fa-wand-magic-sparkles"></i>

                ${escapeHTML(text)}

            `;

        }

    }

}


/* =========================================================
   FRIENDLY API ERROR
========================================================= */

function getFriendlyAPIError(error) {

    const message =
        error?.message ||
        "";


    if (
        message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Backend server is not running. " +
            "Please start the backend with npm.cmd start."
        );

    }


    return message ||
        "Something went wrong. Please try again.";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    if (!toast) return;


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    if (toastIcon) {

        toastIcon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

    }


    toast.classList.remove(
        "show",
        "error"
    );


    if (type === "error") {

        toast.classList.add(
            "error"
        );

    }


    requestAnimationFrame(
        function () {

            toast.classList.add(
                "show"
            );

        }
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   CLOSE MODALS ON OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const templateModal =
            document.getElementById(
                "templateModal"
            );


        const analysisModal =
            document.getElementById(
                "analysisModal"
            );


        if (
            templateModal &&
            event.target ===
                templateModal
        ) {

            closeTemplates();

        }


        if (
            analysisModal &&
            event.target ===
                analysisModal
        ) {

            closeAnalysis();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeTemplates();

            closeAnalysis();

        }

    }
);


/* =========================================================
   AUTO UPDATE PREVIEW
========================================================= */

setInterval(
    function () {

        updatePreview();

    },
    1000
);