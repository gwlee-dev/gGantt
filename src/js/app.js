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
            stackGap: 2,
            tickPositionBottom: false,
            showRange: false,
            useTooltip: true,
            tooltipPlacement: "bottom",
            useTimeline: true,
        };

        constructor(root, data, userOption) {
            this.root = root;
            this.data = data;

            userOption &&
                Object.keys(this.option).forEach((x) => {
                    x in userOption && (this.option[x] = userOption[x]);
                });
            this.prepare();
            this.option.autoInitialize && this.init(userOption);
        }

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

        prepare = () => {
            this.layout = {
                labels: createEl(
                    "div",
                    "label-area",
                    "col-auto",
                    "vstack",
                    `gap-${this.option.stackGap}`,
                    "flex-nowrap",
                    "h-100"
                ),
                divider: {
                    wrap: createEl("div", "divider-wrap", "col-auto"),
                    divider: createEl(
                        "div",
                        "divider",
                        "col-auto",
                        "bg-secondary",
                        "opacity-50",
                        "h-100",
                        "mx-1"
                    ),
                },
                bars: createEl(
                    "div",
                    "bar-area",
                    "col-10",
                    "vstack",
                    `gap-${this.option.stackGap}`,
                    "overflow-auto",
                    "h-100",
                    "position-relative"
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
                timeline: (() => {
                    const el = createEl(
                        "div",
                        "timeline-wrap",
                        "position-absolute",
                        "h-100",
                        "overflow-visible",
                        "bg-warning",
                        "opacity-75"
                    );
                    el.style.width = "2px";
                    el.style.transform = "-1px";
                    el.style.zIndex = 800;
                    return el;
                })(),
            };
        };

        init = () => {
            this.root.className = "row g-0 flex-nowrap";
            const fieldName = createEl("div", "field", "fw-bold");
            fieldName.innerHTML = "데이터명";
            if (this.option.tickPositionBottom) {
                fieldName.classList.add("order-last");
                this.layout.grad.wrap.classList.add("order-last");
            }

            this.layout.divider.divider.style.width = "3px";
            this.layout.divider.wrap.append(this.layout.divider.divider);
            this.layout.divider.wrap.setAttribute("role", "button");

            const mousemoveEvent = ({ clientX }) => {
                const { x: rootX, width } = this.root.getBoundingClientRect();
                const ratio = {
                    label: clientX - rootX,
                    bar: width - clientX + rootX,
                };
                this.layout.labels.style.width =
                    ((ratio.label - 3) / width) * 100 + "%";
                this.layout.bars.style.width = (ratio.bar / width) * 100 + "%";

                console.log(ratio);
            };

            this.layout.divider.wrap.addEventListener("mousedown", () => {
                this.root.style.userSelect = "none";
                this.root.addEventListener("mousemove", mousemoveEvent);
                this.root.addEventListener("mouseup", () => {
                    this.root.style.userSelect = "";
                    this.root.removeEventListener("mousemove", mousemoveEvent);
                });
            });

            this.layout.bars.append(this.layout.timeline);
            this.layout.labels.append(fieldName);
            this.layout.grad.wrap.append(...this.layout.grad.ticks);
            this.layout.bars.append(this.layout.grad.wrap);
            this.root.append(
                this.layout.labels,
                this.layout.divider.wrap,
                this.layout.bars
            );
            this.draw();
            this.option.useTimeline &&
                (this.timeline() || setInterval(this.timeline, 1000));
        };

        createBar = (name, start, end) => {
            if (start > end) {
                alert(name + ": 시작 시간은 종료시간 보다 빠를 수 없습니다.");
                return;
            }

            const label = createEl("div", "label");
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
            const str = `${name}: ${toStr(start)} ~ ${toStr(end)}`;
            this.option.showRange && bar.append(` ${str}`);

            if (this.option.useTooltip) {
                const tooltipWrap = createEl(
                    "div",
                    "tooltip",
                    "position-absolute"
                );
                const tooltip = createEl("div", "position-relative");
                tooltip.setAttribute("data-bs-toggle", "tooltip");
                tooltip.setAttribute(
                    "data-bs-placement",
                    this.option.tooltipPlacement
                );
                tooltip.setAttribute("data-bs-offset", "[10, 20]");
                tooltip.setAttribute("data-bs-trigger", "manual");
                tooltip.setAttribute("title", str);
                tooltipWrap.append(tooltip);
                document.body.append(tooltipWrap);

                const instance = new window.bootstrap.Tooltip(tooltip);
                bar.addEventListener("mouseenter", () => {
                    instance.show();
                });
                bar.addEventListener(
                    "mousemove",
                    ({ clientX: x, clientY: y }) => {
                        tooltipWrap.style.left = x + "px";
                        tooltipWrap.style.top = y + "px";
                        instance.update();
                    }
                );

                bar.addEventListener("mouseleave", () => {
                    instance.hide();
                });
            }

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

                    [groupBar.label, groupBar.barWrap].forEach((x) => {
                        x.setAttribute("data-bs-toggle", "collapse");
                        x.setAttribute(
                            "data-bs-target",
                            `.ggantt-item-${group.id}`
                        );
                        x.setAttribute("role", "button");
                    });

                    this.layout.bars.append(groupBar.barWrap);
                    this.layout.labels.append(groupBar.label);

                    const barCollapse = createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse"
                    );
                    const barCollapseInner = createEl(
                        "div",
                        "collapse-inner",
                        "vstack",
                        `gap-${this.option.stackGap}`
                    );
                    const labelCollapse = createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse",
                        "w-100"
                    );
                    const labelCollapseInner = createEl(
                        "div",
                        "collapse-inner",
                        "vstack",
                        `gap-${this.option.stackGap}`
                    );
                    const objs = getChild(group.schedule);
                    const bars = objs.map((x) => x.barWrap);
                    const labels = objs.map((x) => x.label);

                    barCollapseInner.append(...bars);
                    labelCollapseInner.append(...labels);

                    barCollapse.append(barCollapseInner);
                    labelCollapse.append(labelCollapseInner);

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

        timeline = () => {
            const currentTime = +new Date() - this.lastMidnight;
            const timelinePos = (currentTime / this.dayTime) * 100;
            this.layout.timeline.style.left = timelinePos + "%";
        };
    },
};

const sampleEl = document.querySelector("#ggantt-sample");
const test = new gGantt.Chart(sampleEl, sampleData, {
    // autoInitialize: true, // default: true
    displayMode: "queue", // default: "group"
    // stackGap: 4, // default: 2
    // tickPositionBottom: true, // default: false
    // showRange: true, // default: false
    // useTooltip: true, // default: true
    // tooltipPlacement: "top", // default: bottom
    // useTimeline: true, // default: true
});

(() => {
    window.gGantt = gGantt;
    window.test = test;
})();
export default gGantt;
