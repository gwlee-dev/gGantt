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
            useDivider: true,
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
                    "h-100",
                    "position-relative",
                    "overflow-auto"
                ),
                grad: {
                    wrap: createEl("div", "tick-wrap", "row", "g-0", "w-100"),
                    ticks: [...Array(24)].map((x, index) => {
                        x = createEl(
                            "div",
                            "tick",
                            "col",
                            "text-end",
                            "border-end",
                            "pe-1",
                            "text-truncate"
                        );
                        x.innerHTML = index + 1;
                        return x;
                    }),
                },
                timeline: {
                    wrap: createEl(
                        "div",
                        "timeline-wrap",
                        "position-absolute",
                        "h-100",
                        "w-100"
                    ),
                    inner: createEl(
                        "div",
                        "timeline-inner",
                        "w-100",
                        "h-100",
                        "position-relative"
                    ),
                    timeline: createEl(
                        "div",
                        "timeline",
                        "position-absolute",
                        "h-100",
                        "bg-warning",
                        "opacity-75"
                    ),
                },
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

            this.layout.divider.wrap.append(this.layout.divider.divider);

            const dividerFunc = () => {
                const mousemoveEvent = ({ clientX }) => {
                    const { x: rootX, width } =
                        this.root.getBoundingClientRect();
                    const ratio = {
                        label: clientX - rootX,
                        bar: width - clientX + rootX,
                    };
                    this.layout.labels.style.width =
                        ((ratio.label - 3) / width) * 100 + "%";
                    this.layout.bars.style.width =
                        (ratio.bar / width) * 100 + "%";
                };

                this.layout.divider.wrap.addEventListener("mousedown", () => {
                    this.root.style.userSelect = "none";
                    document.addEventListener("mousemove", mousemoveEvent);
                    document.addEventListener("mouseup", () => {
                        this.root.style.userSelect = "";
                        document.removeEventListener(
                            "mousemove",
                            mousemoveEvent
                        );
                    });
                });
            };

            this.layout.timeline.wrap.append(this.layout.timeline.timeline);
            this.layout.bars.append(this.layout.timeline.wrap);
            this.layout.labels.append(fieldName);
            this.layout.grad.wrap.append(...this.layout.grad.ticks);
            this.layout.bars.append(this.layout.grad.wrap);
            this.root.append(this.layout.labels);
            this.option.useDivider &&
                this.root.append(this.layout.divider.wrap);
            this.root.append(this.layout.bars);

            this.draw();
            this.option.useTimeline &&
                (this.timeline() || setInterval(this.timeline, 1000));
            this.option.useDivider && dividerFunc();
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

            const now = +new Date();
            const done = end < now;
            const queued = start > now;
            const running = !done && !queued;

            const bar = this.template.bar.cloneNode();

            done && bar.classList.add("ggantt-done");
            queued && bar.classList.add("ggantt-queued");
            running && bar.classList.add("ggantt-running");

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

            if (this.option.displayMode === "separated") {
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
            this.layout.timeline.timeline.style.left = timelinePos + "%";
        };
    },
};

const queue = new gGantt.Chart(
    document.querySelector("#ggantt-queue"),
    sampleData,
    { displayMode: "queue" }
);

const group = new gGantt.Chart(
    document.querySelector("#ggantt-group"),
    sampleData
);

const separated = new gGantt.Chart(
    document.querySelector("#ggantt-separated"),
    sampleData,
    { displayMode: "separated" }
);

(() => {
    window.gGantt = gGantt;
    window.sample = { queue, group, separated };
})();
export default gGantt;
