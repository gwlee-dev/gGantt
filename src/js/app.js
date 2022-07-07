import { sampleData } from "../assets/sampleData";

export const gGantt = {
    createEl: (tag, mainClass, ...className) => {
        const element = document.createElement(tag);
        element.className = `ggantt-${mainClass}`;
        element.classList.add(...className);
        return element;
    },
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
            tooltipTemplate: false,
            labelTemplate: false,
            fieldTitle: "데이터명",
            sortChild: true,
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

        lastMidnight = +new Date().setHours(0, 0, 0, 0);
        nextMidnight = +new Date().setHours(24, 0, 0, 0);
        dayTime = 86400000;
        template = {
            barWrap: gGantt.createEl("div", "bar-wrap"),
            bar: gGantt.createEl("div", "bar", "rounded"),
        };

        createdBars = [];

        htmlReplacer = (html, name, start, end) => {
            const guide = {
                title: name,
                start,
                startDate: new Date(start).toLocaleDateString(),
                startYear: new Date(start).getFullYear(),
                startMonth: new Date(start).getMonth() + 1,
                startDay: new Date(start).getDay(),
                startTime: new Date(start).toLocaleTimeString(),
                startGMT: new Date(start).toTimeString(),
                startHour: new Date(start).getHours(),
                startMinute: new Date(start).getMinutes(),
                startSecond: new Date(start).getSeconds(),
                end,
                endDate: new Date(end).toLocaleDateString(),
                endYear: new Date(end).getFullYear(),
                endMonth: new Date(end).getMonth() + 1,
                endDay: new Date(end).getDay(),
                endTime: new Date(end).toLocaleTimeString(),
                endGMT: new Date(end).toTimeString(),
                endHour: new Date(end).getHours(),
                endMinute: new Date(end).getMinutes(),
                endSecond: new Date(end).getSeconds(),
            };
            let newData = html;
            Object.keys(guide).forEach((x) => {
                const regexpString = `@ggantt:${x}@`;
                const regexp = new RegExp(regexpString, "g");
                newData = newData.replace(regexp, guide[x]);
            });
            return newData;
        };

        init = () => {
            this.layout = {
                labels: gGantt.createEl(
                    "div",
                    "label-area",
                    "vstack",
                    `gap-${this.option.stackGap}`
                ),
                divider: {
                    wrap: gGantt.createEl("div", "divider-wrap"),
                    divider: gGantt.createEl("div", "divider"),
                },
                bars: gGantt.createEl(
                    "div",
                    "bar-area",
                    "col-10",
                    "vstack",
                    `gap-${this.option.stackGap}`
                ),
                tick: {
                    wrap: gGantt.createEl("div", "tick-wrap"),
                    ticks: [...Array(24)].map((x, index) => {
                        x = gGantt.createEl("div", "tick", "col");
                        x.innerHTML = index + 1;
                        return x;
                    }),
                },
                timeline: {
                    wrap: gGantt.createEl("div", "timeline-wrap"),
                    inner: gGantt.createEl("div", "timeline-inner"),
                    timeline: gGantt.createEl("div", "timeline"),
                },
                workspace: gGantt.createEl("div", "workspace"),
            };

            this.root.classList.add("ggantt-root");
            const fieldName = gGantt.createEl("div", "field");
            fieldName.innerHTML = this.option.fieldTitle;
            if (this.option.tickPositionBottom) {
                fieldName.classList.add("order-last");
                this.layout.tick.wrap.classList.add("order-last");
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

            document.body.append(this.layout.workspace);
            this.layout.timeline.wrap.append(this.layout.timeline.timeline);
            this.layout.bars.append(this.layout.timeline.wrap);
            this.layout.labels.append(fieldName);
            this.layout.tick.wrap.append(...this.layout.tick.ticks);
            this.layout.bars.append(this.layout.tick.wrap);
            this.root.append(this.layout.labels);
            this.option.useDivider &&
                this.root.append(this.layout.divider.wrap);
            this.root.append(this.layout.bars);

            const idChecks = [];
            const data = this.data.filter((group) => {
                const starts = group.schedule
                    .map((x) => +new Date(x.start))
                    .filter((x) => x < this.nextMidnight);
                const ends = group.schedule
                    .map((x) => +new Date(x.end))
                    .filter((x) => x > this.lastMidnight);
                const idCheck = (id) => {
                    if (idChecks.includes(id)) {
                        throw new TypeError(
                            id + ": ID값은 중복될 수 없습니다."
                        );
                    } else {
                        idChecks.push(id);
                    }
                };
                idCheck(group.id);
                group.schedule.forEach((x) => idCheck(x.id));
                return !!starts.length && !!ends.length;
            });

            const getChild = (schedule) => {
                let childData = schedule;
                this.option.sortChild &&
                    (childData = schedule.sort(
                        (a, b) => new Date(a.start) - new Date(b.start)
                    ));
                console.log(childData);
                return childData.map((child) => {
                    const obj = this.createBar(
                        child.title,
                        +new Date(child.start),
                        +new Date(child.end),
                        child.id
                    );
                    obj.barWrap = this.template.barWrap.cloneNode();
                    obj.barWrap.append(obj.bar);
                    return obj;
                });
            };

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
                        group.id
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

                    const barCollapse = gGantt.createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse"
                    );
                    const barCollapseInner = gGantt.createEl(
                        "div",
                        "collapse-inner",
                        "vstack",
                        `gap-${this.option.stackGap}`
                    );
                    const labelCollapse = gGantt.createEl(
                        "div",
                        `item-${group.id}`,
                        "collapse"
                    );
                    const labelCollapseInner = gGantt.createEl(
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
                    const objs = getChild(group.schedule);

                    const bars = objs.map((x) => x.barWrap);
                    const labels = objs.map((x) => x.label);

                    this.layout.bars.append(...bars);
                    this.layout.labels.append(...labels);
                });
            }

            if (this.option.displayMode === "queue") {
                data.forEach((group) => {
                    const earliest = Math.min(
                        ...group.schedule.map((item) => +new Date(item.start))
                    );
                    const latest = Math.max(
                        ...group.schedule.map((item) => +new Date(item.end))
                    );
                    const label = gGantt.createEl("div", "label");
                    const labelBind = this.option.labelTemplate
                        ? this.htmlReplacer(
                              this.option.labelTemplate,
                              group.title,
                              earliest,
                              latest
                          )
                        : group.title;
                    label.innerHTML = labelBind;

                    const objs = group.schedule.map((child) => {
                        const obj = this.createBar(
                            child.title,
                            +new Date(child.start),
                            +new Date(child.end),
                            child.id
                        );
                        return obj.bar;
                    });

                    const barWrap = this.template.barWrap.cloneNode();
                    barWrap.append(...objs);

                    this.layout.bars.append(barWrap);
                    this.layout.labels.append(label);
                });
            }

            const timelineFunc = () => {
                const now = +new Date();
                const currentTime = now - this.lastMidnight;
                const timelinePos = (currentTime / this.dayTime) * 100;
                this.layout.timeline.timeline.style.left = timelinePos + "%";

                const bindClass = (arr, stat) => {
                    arr.map((obj) => {
                        if (
                            ![...obj.bar.classList].includes(
                                "ggantt-status-" + stat
                            )
                        )
                            Array.from(obj.bar.classList)
                                .filter((x) => x.startsWith("ggantt-status-"))
                                .map((x) => obj.bar.classList.remove(x));
                        obj.bar.classList.add("ggantt-status-" + stat);
                        return obj;
                    });
                };

                this.runningBars = bindClass(
                    this.createdBars.filter(
                        (obj) => obj.start < now && obj.end > now
                    ),
                    "running"
                );
                this.runningBars = bindClass(
                    this.createdBars.filter(
                        (obj) => obj.start < now && obj.end < now
                    ),
                    "done"
                );
                this.runningBars = bindClass(
                    this.createdBars.filter((obj) => obj.start > now),
                    "queued"
                );
            };

            this.option.useTimeline &&
                (timelineFunc() || setInterval(timelineFunc, 1000));
            this.option.useDivider && dividerFunc();
        };

        createBar = (name, start, end, id) => {
            if (start > end) {
                throw new TypeError(
                    name + ": 시작 시간은 종료시간 보다 빠를 수 없습니다."
                );
            }

            const alreadyStarted = start < this.lastMidnight;
            const beContinue = end > this.nextMidnight;
            let dueOffset = 0;
            alreadyStarted && (dueOffset = this.lastMidnight - start);
            const barDuring = ((end - start - dueOffset) / this.dayTime) * 100;
            const barStart = ((start - this.lastMidnight) / this.dayTime) * 100;

            const bar = this.template.bar.cloneNode();
            bar.id = id;

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

            const labelBind = this.option.labelTemplate
                ? this.htmlReplacer(this.option.labelTemplate, name, start, end)
                : name;

            const label = gGantt.createEl("div", "label");
            label.innerHTML = labelBind;

            if (this.option.useTooltip) {
                const tooltipWrap = gGantt.createEl("div", "tooltip");
                const tooltip = gGantt.createEl("div", "v-element");
                tooltipWrap.append(tooltip);
                this.layout.workspace.append(tooltipWrap);

                const tooltipBind = this.option.tooltipTemplate
                    ? this.htmlReplacer(
                          this.option.tooltipTemplate,
                          name,
                          start,
                          end
                      )
                    : str;

                const instance = new window.bootstrap.Tooltip(tooltip, {
                    offset: "[10, 20]",
                    trigger: "manual",
                    placement: this.option.tooltipPlacement,
                    container: this.layout.workspace,
                    html: true,
                    title: tooltipBind,
                });
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
                this.createdBars.push({ bar, start, end });
            }

            return { bar, label };
        };
    },
};

window.gGantt = gGantt;
export default gGantt;

const queue = new gGantt.Chart(
    document.querySelector("#ggantt-queue"),
    sampleData,
    {
        displayMode: "queue",
    }
);
const group = new gGantt.Chart(
    document.querySelector("#ggantt-group"),
    sampleData
);
const separated = new gGantt.Chart(
    document.querySelector("#ggantt-separated"),
    sampleData,
    {
        displayMode: "separated",
    }
);

window.sample = { queue, group, separated };
