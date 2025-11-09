/**
 * @typedef {string[]} DescriptionContent
 */

/**
 * @typedef {object} Content
 * @property {string} name - 이름
 * @property {string} period - 날짜
 * @property {string?} description - 설명
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchContentAndRender('ko');
});

async function fetchContentAndRender(lang) {
    const response = await fetch(`content-${lang}.json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data)
    renderSummary(data.summary)
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
    summary.paragraphs.forEach(p=>{
        const temp = document.createElement('div')
        temp.innerHTML = marked.parse(p)
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
                <h4>${skill.name}</h4>
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
    educations.forEach(education=>{
        const temp = document.createElement("div");
        temp.innerHTML = `
            <div class="education">
              <h3>${education.name}</h3>
              <p class="text-secondary">${education.period}</p>
            </div>
        `;
        section.appendChild(temp.firstElementChild);
    })

}