import { sampleData } from "./sampleData";

const createEl = (tag, mainClass, ...className) => {
    const element = document.createElement(tag);
    element.className = `ggantt-${mainClass}`;
    element.classList.add(...className);
    return element;
};

export const gGantt = {
    Chart: class {
        option = {
            autoInitialize: true,
            displayMode: "collapse",
        };

        constructor(root, data, userOption) {
            this.root = root;
            this.data = data;

            userOption &&
                Object.keys(this.option).forEach((x) => {
                    x in userOption && (this.option[x] = userOption[x]);
                });
            this.option.autoInitialize && this.init(userOption);
        }

        layout = {
            labels: createEl(
                "div",
                "label-area",
                "col",
                "col-2",
                "flex-nowrap"
            ),
            bars: createEl("div", "bar-area", "col", "col-10", "overflow-auto"),
            grad: {
                wrap: createEl(
                    "div",
                    "label-area",
                    "row",
                    "g-0",
                    "flex-nowrap",
                    "mb-2"
                ),
                ticks: [...Array(24)].map((x, index) => {
                    x = createEl(
                        "div",
                        "tick",
                        "col",
                        "text-end",
                        "border-end",
                        "pe-1"
                    );
                    x.innerHTML = index + 1;
                    return x;
                }),
            },
        };

        lastMidnight = +new Date().setHours(0, 0, 0, 0);
        nextMidnight = +new Date().setHours(24, 0, 0, 0);
        dayTime = 86400000;
        template = {
            barWrap: createEl("div", "bar-wrap", "d-flex", "w-100"),
            barWrapInner: createEl("div", "bar-wrap", "d-flex", "w-100"),
            bar: createEl(
                "div",
                "bar",
                "rounded",
                "text-white",
                "fw-bold",
                "ps-2",
                "bg-primary",
                "text-truncate"
            ),
        };

        init = () => {
            this.root.className = "row";
            const fieldName = createEl(
                "div",
                "field",
                "w-100",
                "fw-bold",
                "mb-2"
            );
            fieldName.innerHTML = "데이터명";
            this.layout.labels.append(fieldName);
            this.layout.grad.wrap.append(...this.layout.grad.ticks);
            this.layout.bars.append(this.layout.grad.wrap);
            this.root.append(this.layout.labels, this.layout.bars);
            this.draw();
        };

        createBar = (name, start, end, labelTag) => {
            const label = createEl(labelTag || "div", "label");
            label.innerHTML = name;

            const alreadyStarted = start < this.lastMidnight;
            let dueOffset = 0;
            alreadyStarted && (dueOffset = this.lastMidnight - start);
            const barDuring = ((end - start - dueOffset) / this.dayTime) * 100;
            const barStart = ((start - this.lastMidnight) / this.dayTime) * 100;

            const barWrap = this.template.barWrap.cloneNode();
            const bar = this.template.bar.cloneNode();

            !alreadyStarted && (bar.style.marginLeft = barStart + "%");
            bar.style.width = barDuring + "%";
            bar.innerHTML = `${name} (${new Date(
                start
            ).toLocaleString()} ~ ${new Date(end).toLocaleString()})`;
            barWrap.append(bar);

            return { barWrap, label };
        };

        draw = () => {
            this.data
                .filter((group) => {
                    const starts = group.schedule
                        .map((x) => +new Date(x.start))
                        .filter((x) => x < this.nextMidnight);
                    const ends = group.schedule
                        .map((x) => +new Date(x.end))
                        .filter((x) => x > this.lastMidnight);
                    return !!starts.length && !!ends.length;
                })
                .forEach((group) => {
                    const earliest = Math.min(
                        ...group.schedule.map((item) => +new Date(item.start))
                    );
                    const latest = Math.max(
                        ...group.schedule.map((item) => +new Date(item.end))
                    );
                    const groupBar = this.createBar(
                        group.title,
                        earliest,
                        latest,
                        "button"
                    );

                    groupBar.label.classList.add("border-0", "m-0");
                    groupBar.label.setAttribute("data-bs-toggle", "collapse");
                    groupBar.label.setAttribute(
                        "data-bs-target",
                        `.ggantt-item-${group.id}`
                    );

                    this.layout.bars.append(groupBar.barWrap);
                    this.layout.labels.append(groupBar.label);

                    const barCollapse = createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse"
                    );
                    const labelCollapse = createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse"
                    );
                    const objs = group.schedule.map((child) => {
                        const obj = this.createBar(
                            child.title,
                            +new Date(child.start),
                            +new Date(child.end),
                            true
                        );
                        return obj;
                    });
                    const bars = objs.map((x) => x.barWrap);
                    const labels = objs.map((x) => x.label);

                    barCollapse.append(...bars);
                    labelCollapse.append(...labels);

                    this.layout.bars.append(barCollapse);
                    this.layout.labels.append(labelCollapse);
                });
        };
    },
};

const sampleEl = document.querySelector("#ggantt-sample");
const test = new gGantt.Chart(sampleEl, sampleData, {
    autoInitialize: true, // default: true
    displayMode: "collapse", // default: "collapse"
});

(() => {
    window.gGantt = gGantt;
    window.test = test;
})();
export default gGantt;
