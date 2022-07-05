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
            displayMode: "group",
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
            const label = createEl(labelTag || "div", "label", "w-100");
            label.innerHTML = name;

            const alreadyStarted = start < this.lastMidnight;
            const beContinue = end > this.nextMidnight;
            let dueOffset = 0;
            alreadyStarted && (dueOffset = this.lastMidnight - start);
            const barDuring = ((end - start - dueOffset) / this.dayTime) * 100;
            const barStart = ((start - this.lastMidnight) / this.dayTime) * 100;

            const bar = this.template.bar.cloneNode();

            !alreadyStarted && (bar.style.marginLeft = barStart + "%");
            (alreadyStarted || beContinue) && bar.classList.remove("rounded");
            alreadyStarted && !beContinue && bar.classList.add("rounded-end");
            !alreadyStarted && beContinue && bar.classList.add("rounded-start");
            bar.style.width = barDuring + "%";
            bar.innerHTML = `${name} (${new Date(
                start
            ).toLocaleString()} ~ ${new Date(end).toLocaleString()})`;

            return { bar, label };
        };

        draw = () => {
            const data = this.data.filter((group) => {
                const starts = group.schedule
                    .map((x) => +new Date(x.start))
                    .filter((x) => x < this.nextMidnight);
                const ends = group.schedule
                    .map((x) => +new Date(x.end))
                    .filter((x) => x > this.lastMidnight);
                return !!starts.length && !!ends.length;
            });

            if (this.option.displayMode === "group") {
                data.forEach((group) => {
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
                    groupBar.barWrap = this.template.barWrap.cloneNode();
                    groupBar.barWrap.append(groupBar.bar);

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
                        "collapse",
                        "w-100"
                    );
                    const objs = group.schedule.map((child) => {
                        const obj = this.createBar(
                            child.title,
                            +new Date(child.start),
                            +new Date(child.end),
                            "div"
                        );
                        obj.barWrap = this.template.barWrap.cloneNode();
                        obj.barWrap.append(obj.bar);
                        return obj;
                    });
                    const bars = objs.map((x) => x.barWrap);
                    const labels = objs.map((x) => x.label);

                    barCollapse.append(...bars);
                    labelCollapse.append(...labels);

                    this.layout.bars.append(barCollapse);
                    this.layout.labels.append(labelCollapse);
                });
            }

            if (this.option.displayMode === "several") {
                data.forEach((group) => {
                    const label = createEl("div", "label", "w-100");
                    label.innerHTML = group.title;

                    const objs = group.schedule.map((child) => {
                        const obj = this.createBar(
                            child.title,
                            +new Date(child.start),
                            +new Date(child.end),
                            "div"
                        );
                        obj.barWrap = this.template.barWrap.cloneNode();
                        obj.barWrap.append(obj.bar);
                        return obj;
                    });
                    const bars = objs.map((x) => x.barWrap);
                    const labels = objs.map((x) => x.label);

                    this.layout.bars.append(...bars);
                    this.layout.labels.append(...labels);
                });
            }

            if (this.option.displayMode === "queue") {
                data.forEach((group) => {
                    const label = createEl("div", "label", "w-100");
                    label.innerHTML = group.title;

                    const objs = group.schedule.map((child) => {
                        const obj = this.createBar(
                            child.title,
                            +new Date(child.start),
                            +new Date(child.end),
                            "div"
                        );
                        obj.barWrap = this.template.barWrap.cloneNode();
                        obj.barWrap.classList.add(
                            "position-absolute",
                            "start-0",
                            "top-50",
                            "translate-middle-y"
                        );
                        obj.barWrap.append(obj.bar);
                        return obj.barWrap;
                    });

                    const queue = createEl(
                        "div",
                        "queue",
                        "w-100",
                        "position-relative"
                    );
                    queue.innerHTML = "&nbsp;";

                    queue.append(...objs);
                    this.layout.bars.append(queue);
                    this.layout.labels.append(label);
                });
            }
        };
    },
};

const sampleEl = document.querySelector("#ggantt-sample");
const test = new gGantt.Chart(sampleEl, sampleData, {
    autoInitialize: true, // default: true
    displayMode: "queue", // default: "collapse"
});

(() => {
    window.gGantt = gGantt;
    window.test = test;
})();
export default gGantt;
