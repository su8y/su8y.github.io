import {darkMapStyleObject, lightMapStyleObject} from "./layer.js";

const dark = {
    text: 'dark',
    themeToggle: '🌙',
    mapLayer: darkMapStyleObject,
    githubIcon: 'assets/images/github-mark-white.svg'

};
const light = {
    text: 'light',
    themeToggle: '☀️',
    mapLayer: lightMapStyleObject,
    githubIcon: 'assets/images/github-mark.svg'
}

export {dark, light};