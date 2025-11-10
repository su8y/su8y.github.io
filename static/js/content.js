/**
 * @typedef {string[]} DescriptionContent
 */

/**
 * @typedef {object} Content
 * @property {string} name - 이름
 * @property {string} period - 날짜
 * @property {string?} description - 설명
 */


const languageChangeEventListener = (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem('language', selectedLanguage);
    console.log(`HI${selectedLanguage}`)
    applyTranslations();
    window.location.reload();
}

async function loadLanguageData() {
    const lang = localStorage.getItem('language')
    const response = await fetch(`${lang}.json`);
    return response.json();
}

async function applyTranslations() {
    const translations = await loadLanguageData();

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[key];

        if (translation) {
            if (element.tagName === 'TITLE') {
                document.title = translation;
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

}

document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem("language") || localStorage.setItem("language", "ko");
    const languageSelect = document.getElementById('language-select');

    languageSelect.addEventListener('change', languageChangeEventListener);
    fetchContentAndRender(lang);
    applyTranslations()
    languageSelect.value = localStorage.getItem('language') || 'ko';
});

async function fetchContentAndRender(lang) {
    const response = await fetch(`content-${lang}.json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    renderSummary(data.summary)
    renderExperience(data.experiences)
    renderOtherExperience(data['other-experiences'])
    renderSkills(data.skills)
    renderEducation(data.educations)
}

/**
 * @typedef {object} Summary
 * @property {DescriptionContent} paragraphs - 기술 스택의 이름
 */

/**
 *
 * @param {Summary} summary
 */

function renderSummary(summary) {
    const section = document.getElementById("section-summary")
    summary.paragraphs.forEach(p => {
        const temp = document.createElement('div')
        temp.innerHTML = marked.parse(p)
        section.appendChild(temp.firstElementChild);
    })
}

/**
 * @typedef {object} Experience
 * @property {string} name - 이름
 * @property {string} role - 이름
 * @property {string} period - 날짜
 * @property {string[]} background - 배경
 * @property {string[]} content - 배경
 * @property {string[]} result - 배경
 * @property {string} additional - 배경
 * @property {string[]} images - 배경
 * @property {Additional[]} additional
 */

/**
 *
 * @param {Experience[]} experiences
 */
function renderExperience(experiences) {
    const section = document.getElementById("section-experience").querySelector(".timeline-container");
    experiences.forEach((experience,i)=>{
        const bgElementList = experience.background && experience.background.map(e=>(`<li>${marked.parse(e)}</li>`));
        const contentElementList =experience.content && experience.content.map(e=>(`<li>${marked.parse(e)}</li>`));
        const resultElementList = experience.result && experience.result.map(e=>(`<li>${marked.parse(e)}</li>`));
        const imageElement = experience.images && createCarousel(i, experience.images);

        const temp = document.createElement('div');
        temp.innerHTML = `
        <div class="work-item ${i === 0 ? 'current' : ''}">
            <h3 class="text-lg">${experience.name}</h3>
            <span>${experience.role} (${experience.period})</span>
            ${imageElement ? imageElement : ''}
            ${bgElementList ? `[<strong class="text-sm" data-i18n="background">배경</strong>]:
                <ul>
                ${bgElementList.join("")}
                </ul>` : ''}
            ${contentElementList ? `[<strong class="text-sm" data-i18n="content">내용</strong>]:
                <ul>
                ${contentElementList.join("")}
                </ul>` : ''}
            ${resultElementList ? `[<strong class="text-sm" data-i18n="result">결과</strong>]:
                <ul>
                ${resultElementList.join("")}
                </ul>` : ''}
        </div>
        `
        section.appendChild(temp.firstElementChild);
    })

}

/**
 *
 * @param {Experience[]} experiences
 */
function renderOtherExperience(otherExperiences) {
    const section = document.getElementById("section-other").querySelector(".other-activities");
    otherExperiences.forEach((experience,i)=>{
        const bgElementList = experience.background && experience.background.map(e=>(`<li>${marked.parse(e)}</li>`));
        const contentElementList =experience.content && experience.content.map(e=>(`<li>${marked.parse(e)}</li>`));
        const resultElementList = experience.result && experience.result.map(e=>(`<li>${marked.parse(e)}</li>`));
        const imageElement = experience.images && createCarousel(`other-${i}`, experience.images);

        const temp = document.createElement('div');
        temp.innerHTML = `
        <div class="activity-item">
            <h3 class="text-lg">${experience.name}</h3>
            <p class="text-sm">${experience.role} (${experience.period})</p>
            ${imageElement ? imageElement : ''}
            ${bgElementList ? `
                <ul>
                ${bgElementList.join("")}
                </ul>` : ''}
            ${contentElementList ? `
                <ul>
                ${contentElementList.join("")}
                </ul>` : ''}
            ${resultElementList ? `
                <ul>
                ${resultElementList.join("")}
                </ul>` : ''}
            
        </div>
        `
        section.appendChild(temp.firstElementChild);
    })

}

/**
 * @typedef {object} Skill
 * @property {string} name - 기술 스택의 이름
 * @property {string} description - 해당 기술 스택에 대한 설명.
 */

/**
 * 이 함수는 기술 스택 목록을 처리합니다.
 *
 * @param {Skill[]} skills - Skill 객체들의 배열.
 */
function renderSkills(skills) {
    const skillSection = document.getElementById("section-skill")

    skills.forEach(skill => {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = `
            <div class="skill-group">
                <h3 class="text-lg">${skill.name}</h3>
                <p>${skill.description}</p>
            </div>
        `
        skillSection.appendChild(tempContainer.firstElementChild)
    })


}

/**
 * @typedef {object} Education
 * @property {string} name - 이름
 * @property {string} period - 날짜
 */
/**
 *
 * @param {Education[]} educations
 */
function renderEducation(educations) {
    const section = document.getElementById("section-education")
    educations.forEach(education => {
        const temp = document.createElement("div");
        temp.innerHTML = `
            <div class="education">
              <h3 class="text-lg">${education.name}</h3>
              <p class="text-secondary">${education.period}</p>
            </div>
        `;
        section.appendChild(temp.firstElementChild);
    })

}