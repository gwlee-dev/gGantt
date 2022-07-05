import { createPopper } from "@popperjs/core";
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
            showRange: true,
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
                "vstack",
                "gap-2",
                "flex-nowrap",
                "h-100"
            ),
            bars: createEl(
                "div",
                "bar-area",
                "col",
                "col-10",
                "vstack",
                "gap-2",
                "overflow-auto",
                "h-100"
            ),
            grad: {
                wrap: createEl("div", "tick", "row", "g-0", "flex-nowrap"),
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
            barWrap: createEl(
                "div",
                "bar-wrap",
                "d-flex",
                "w-100",
                "position-relative"
            ),
            barWrapInner: createEl("div", "bar-wrap", "d-flex", "w-100"),
            bar: createEl(
                "div",
                "bar",
                "rounded",
                "text-white",
                "fw-bold",
                "ps-2",
                "bg-primary",
                "text-truncate",
                "position-absolute"
            ),
        };

        init = () => {
            this.root.className = "row";
            const fieldName = createEl("div", "field", "w-100", "fw-bold");
            fieldName.innerHTML = "데이터명";
            if (this.option.tickPosition === "bottom") {
                fieldName.classList.add("order-last");
                this.layout.grad.wrap.classList.add("order-last");
            }

            this.layout.labels.append(fieldName);
            this.layout.grad.wrap.append(...this.layout.grad.ticks);
            this.layout.bars.append(this.layout.grad.wrap);
            this.root.append(this.layout.labels, this.layout.bars);
            this.draw();
        };

        createBar = (name, start, end) => {
            const label = createEl("div", "label", "w-100");
            label.innerHTML = name;

            const alreadyStarted = start < this.lastMidnight;
            const beContinue = end > this.nextMidnight;
            let dueOffset = 0;
            alreadyStarted && (dueOffset = this.lastMidnight - start);
            const barDuring = ((end - start - dueOffset) / this.dayTime) * 100;
            const barStart = ((start - this.lastMidnight) / this.dayTime) * 100;

            const bar = this.template.bar.cloneNode();

            !alreadyStarted && (bar.style.left = barStart + "%");
            (alreadyStarted || beContinue) && bar.classList.remove("rounded");
            alreadyStarted && !beContinue && bar.classList.add("rounded-end");
            !alreadyStarted && beContinue && bar.classList.add("rounded-start");
            bar.style.width = beContinue
                ? 100 - barStart + "%"
                : barDuring + "%";
            bar.innerHTML = name;
            const toStr = (date) => new Date(date).toLocaleString();
            const str = `${toStr(start)} ~ ${toStr(end)}`;
            this.option.showRange && bar.append(` ${str}`);

            const tooltip = createEl("div", "tooltip", "position-absolute");
            tooltip.setAttribute("data-bs-toggle", "tooltip");
            tooltip.setAttribute("data-bs-trigger", "manual");
            tooltip.setAttribute("title", str);
            this.root.append(tooltip);

            const instance = new window.bootstrap.Tooltip(tooltip);
            bar.addEventListener("mousemove", () => {
                instance.show();
            });

            bar.addEventListener("mouseleave", () => {
                instance.hide();
            });

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

            const getChild = (schedule) =>
                schedule.map((child) => {
                    const obj = this.createBar(
                        child.title,
                        +new Date(child.start),
                        +new Date(child.end)
                    );
                    obj.barWrap = this.template.barWrap.cloneNode();
                    obj.barWrap.append(obj.bar);
                    return obj;
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
                        latest
                    );
                    groupBar.barWrap = this.template.barWrap.cloneNode();
                    groupBar.barWrap.append(groupBar.bar);

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
                    const objs = getChild(group.schedule);
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

                    const objs = getChild(group.schedule);

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
                            +new Date(child.end)
                        );
                        return obj.bar;
                    });

                    const barWrap = this.template.barWrap.cloneNode();
                    barWrap.append(...objs);

                    this.layout.bars.append(barWrap);
                    this.layout.labels.append(label);
                });
            }
        };
    },
};

const sampleEl = document.querySelector("#ggantt-sample");
const test = new gGantt.Chart(sampleEl, sampleData, {
    autoInitialize: true, // default: true
    displayMode: "queue", // default: "group"
    // tickPosition: "bottom", // default: null
    showRange: true, // default: true
});

(() => {
    window.gGantt = gGantt;
    window.test = test;
})();
export default gGantt;
