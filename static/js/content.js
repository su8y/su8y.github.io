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
    languageSelect.value = lang
    fetchContentAndRender(lang).then(()=>{
        applyTranslations()
    })
});

async function fetchContentAndRender(lang) {
    const response = await fetch(`content-${lang}.json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    renderHello(data.hello);
    renderSummary(data.summary)
    renderExperience(data.experiences)
    renderOtherExperience(data['other-experiences'])
    renderSkillCategories(data.skills)
    renderEducation(data.educations)
}


function renderHello(hello) {
    const section = document.getElementById("section-hello")
    hello.forEach(p => {
        const temp = document.createElement('div')
        temp.innerHTML = marked.parse(p)
        section.appendChild(temp.firstElementChild);
    })
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
        const contentElementList =experience.content && experience.content.map(e=>(`${marked.parse(e)}`));
        const resultElementList = experience.result && experience.result.map(e=>(`<li>${marked.parse(e)}</li>`));
        const imageElement = experience.images && createCarousel(`other-${i}`, experience.images);

        const temp = document.createElement('div');
        temp.innerHTML = `
        <div class="activity-item">
            <div style="display: flex; gap:3px;">
                <h3 class="text-lg">${experience.name}</h3>
                <p class="text-sm">${experience.role} (${experience.period})</p>
            </div>
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
 * 이 함수는 기술 스택 객체를 받아 카테고리별로 렌더링합니다.
 * (CSS flex 레이아웃에 맞게 HTML 구조 생성)
 *
 * @param {object} skillCategories - { backend: Skill[], DevOps: Skill[] ... } 형태의 객체
 */
function renderSkillCategories(skillCategories) {
    const skillSection = document.getElementById("section-skill");

    // 1. 카테고리 객체를 순회합니다 (예: ["backend", [{...},...]] )
    for (const [categoryName, skills] of Object.entries(skillCategories)) {
        
        // 2. 카테고리 전체를 감싸는 .skill-category-container 생성 (Flex 부모)
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'skill-category-container';

        // 3. 왼쪽 카테고리명(.skill-category-name) 생성
        const categoryNameDiv = document.createElement('h5');
        categoryNameDiv.textContent = categoryName;
        categoryNameDiv.className = "skill-category-name"
        categoryContainer.appendChild(categoryNameDiv); // (Flex 자식 1)

        // 4. 오른쪽 기술 목록(.skill-list)을 감싸는 컨테이너 생성
        const skillListDiv = document.createElement('div');
        skillListDiv.className = 'skill-list';

        // 5. 개별 기술(.skill-item)을 만들어서 skill-list에 추가
        skills.forEach(skill => {
            const skillItemDiv = document.createElement('div');
            skillItemDiv.className = 'skill-item';

            // 설명(description)이 있을 때만 <p> 태그 생성
            const descriptionHtml = skill.description 
                ? `<small>${marked.parse(skill.description)}</small>`
                : '';

            skillItemDiv.innerHTML = `
                <h6>${skill.name}</h6>
                ${descriptionHtml}
            `;
            
            // skill-list에 개별 기술 추가
            skillListDiv.appendChild(skillItemDiv); 
        });

        // 6. 완성된 skill-list를 category-container에 추가 (Flex 자식 2)
        categoryContainer.appendChild(skillListDiv);

        // 7. 완성된 카테고리 그룹을 최상위 섹션에 추가
        skillSection.appendChild(categoryContainer);
    }
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