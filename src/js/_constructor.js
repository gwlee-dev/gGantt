import { bindStatusClass } from "./_bind";
import { constant, option } from "./_default";
import { display } from "./_display.js";
import { createDivider } from "./_dom";
import { checkOptions, createEl, startTransition } from "./_tool";
import { update } from "./_update";

export const Chart = class {
    option = { ...option };
    storage = {};

    constructor(root, data, userOption) {
        this.root = root;
        this.data = data.filter((x) => x.schedule.length);
        this.id = Math.random().toString().substring(2, 8);

        Object.assign(this.option, userOption);
        checkOptions(this.option) &&
            this.option.autoInitialize &&
            this.init(userOption);
    }

    scrollIntoX = (percent) => {
        const { scrollWidth: outer, clientWidth: inner } = this.layout.bars;
        this.layout.bars.scrollLeft = (outer - inner) * percent;
    };

    init = () => {
        this.layout = {
            labels: createEl("div", "label-area"),
            divider: {
                wrap: createEl("div", "divider-wrap"),
                divider: createEl("div", "divider"),
            },
            bars: createEl("div", "bar-area"),
            tick: {
                wrap: createEl("div", "tick-wrap"),
                ticks: [...Array(this.option.timeDivision)].map((x, index) => {
                    x = createEl("div", "tick");
                    const span = createEl("span", "text");
                    span.innerHTML =
                        (24 / this.option.timeDivision) * (index + 1);
                    x.append(span);
                    return x;
                }),
            },
            timeline: {
                wrap: createEl("div", "timeline-wrap"),
                inner: createEl("div", "timeline-inner"),
                timeline: createEl("div", "timeline"),
            },
            cursor: createEl("div", "cursor"),
            workspace: createEl("div", "workspace"),
        };

        this.root.classList.add("ggantt");
        this.option.useRowBorder &&
            this.root.classList.add("ggantt-row-border");

        const idChecks = [];
        const data = this.data.filter((group) => {
            const starts = group.schedule
                .map((x) => +new Date(x.start))
                .filter((x) => x < constant.nextMidnight);
            const ends = group.schedule
                .map((x) => +new Date(x.end))
                .filter((x) => x > constant.lastMidnight);
            const idCheck = (id) => {
                if (idChecks.includes(id)) {
                    throw new TypeError(id + ": ID값은 중복될 수 없습니다.");
                } else {
                    idChecks.push(id);
                }
            };
            idCheck(group.id);
            group.schedule.forEach((x) => idCheck(x.id));
            return !!starts.length && !!ends.length;
        });

        if (data.length) {
            const fieldName = createEl("div", "field");
            const span = createEl("span", "text");
            span.innerHTML = this.option.fieldTitle;
            fieldName.append(span);

            document.body.append(this.layout.workspace);
            this.layout.bars.append(this.layout.timeline.wrap);
            if (this.option.useCursor) {
                this.layout.bars.append(this.layout.cursor);
                const cursorFunc = ({ clientX }) => {
                    const { x } = this.layout.bars.getBoundingClientRect();
                    this.layout.cursor.style.left = clientX - x + "px";
                };

                this.layout.bars.addEventListener("mouseenter", () => {
                    this.layout.cursor.classList.add("show");
                    this.root.addEventListener("mousemove", cursorFunc);
                });

                this.layout.bars.addEventListener("mouseleave", () => {
                    this.layout.cursor.classList.remove("show");
                    this.root.removeEventListener("mousemove", cursorFunc);
                });
            }
            this.layout.labels.append(fieldName);
            this.layout.tick.wrap.append(...this.layout.tick.ticks);
            this.layout.bars.append(this.layout.tick.wrap);
            this.root.append(this.layout.labels);
            this.option.useDivider &&
                this.root.append(this.layout.divider.wrap);
            this.root.append(this.layout.bars);
        } else {
            const voidStatus = createEl("div", "void");
            voidStatus.innerHTML = "표시할 내용이 없습니다.";
            this.root.append(voidStatus);
            this.root.classList.add("ggantt-no-contents");
        }

        data.forEach((group) => display[this.option.displayMode](this, group));

        startTransition();

        const timelineFunc = () => {
            this.layout.timeline.wrap.append(this.layout.timeline.timeline);
            const now = +new Date();
            const currentTime = now - constant.lastMidnight;
            const timelinePos = currentTime / constant.dayTime;
            this.layout.timeline.timeline.style.left = timelinePos * 100 + "%";
            return timelinePos;
        };

        bindStatusClass(this.storage);

        if (this.option.useTimeline) {
            const pos = timelineFunc();
            this.timelineInterval = setInterval(timelineFunc, 1000);
            this.scrollIntoX(pos);
        }
        this.option.useDivider && createDivider(this);
    };

    removeGroup = (id) => {
        const target = this.storage[id];
        Object.keys(target.dom).forEach((x) => {
            const element = target.dom[x];
            const bars = element.querySelectorAll(".ggantt-bar");
            [...bars].forEach((bar) => {
                bar.classList.add("removing");
            });
            setTimeout(() => element.remove(), 500);
        });
        this.data = this.data.filter((x) => x.id !== id);
        delete this.storage[id];
    };

    updateAll = (inputData) => {
        const data = [...inputData];
        const newData = data.filter((x) => x.schedule.length);
        const existDataIds = this.data.map(({ id }) => id);
        const newDataIds = newData.map(({ id }) => id);
        newData
            .filter(({ id }) => !existDataIds.includes(id))
            .forEach((group) => {
                display[this.option.displayMode](this, group);
                this.data.push(group);
            });

        this.data
            .filter(({ id }) => !newDataIds.includes(id))
            .forEach((group) => this.removeGroup(group.id));

        newData
            .filter(({ id }) => existDataIds.includes(id))
            .forEach((group) => {
                update[this.option.displayMode].modify(this, group);
            });

        this.data.forEach((group) => {
            update[this.option.displayMode].remove(this, group, data);
        });

        this.data = data;

        startTransition();
        bindStatusClass(this.storage);

        console.log(this.data);
    };
};
