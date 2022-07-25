export const createEl = (tag, mainClass, ...className) => {
    const element = document.createElement(tag);
    element.className = `ggantt-${mainClass}`;
    element.classList.add(...className);
    return element;
};
export const checkOptions = (option) => {
    const needs = option.useTooltip || option.displayMode === "group";
    const imported =
        typeof window.bootstrap !== "undefined" ||
        typeof bootstrap !== "undefined";
    if (needs && imported) {
        return true;
    } else {
        if (!imported) {
            throw new TypeError("bootstrap.js를 불러오지 못했습니다.");
        } else {
            throw new TypeError("설정 값에 오류가 있습니다.");
        }
    }
};
export const startTransition = () => {
    setTimeout(() => {
        document
            .querySelectorAll(".pending")
            .forEach((x) => x.classList.remove("pending"));
    }, 100);
};
