export const hoverGroup = (...els) => {
    const elements = [...els];
    elements.forEach((x) => {
        x.addEventListener("mouseenter", () =>
            elements.forEach((el) => el.classList.add("hover"))
        );
        x.addEventListener("mouseleave", () =>
            elements.forEach((el) => el.classList.remove("hover"))
        );
    });
};
