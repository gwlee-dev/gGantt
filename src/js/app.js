export const gGantt = {
    lastMidnight: +new Date().setHours(0, 0, 0, 0),
    nextMidnight: +new Date().setHours(24, 0, 0, 0),
    dayTime: 86400000,
    option: {
        autoInitialize: true,
        displayMode: "group",
        useTooltip: true,
        tooltipPlacement: "bottom",
        useTimeline: true,
        useDivider: true,
        fieldTitle: "데이터명",
        sortChild: true,
        useCursor: true,
        timeDivision: 24,
        useRowBorder: true,
    },
};

gGantt.createEl = (tag, mainClass, ...className) => {
    const element = document.createElement(tag);
    element.className = `ggantt-${mainClass}`;
    element.classList.add(...className);
    return element;
};

gGantt.template = {
    barWrap: gGantt.createEl("div", "bar-wrap"),
    bar: gGantt.createEl("div", "bar", "pending"),
};

gGantt.settingBar = (start, end, bar) => {
    const alreadyStarted = start < gGantt.lastMidnight;
    const beContinue = end > gGantt.nextMidnight;
    let dueOffset = 0;
    alreadyStarted && (dueOffset = gGantt.lastMidnight - start);
    const barDuring = ((end - start - dueOffset) / gGantt.dayTime) * 100;
    const barStart = ((start - gGantt.lastMidnight) / gGantt.dayTime) * 100;

    !alreadyStarted && (bar.style.left = barStart + "%");
    if (alreadyStarted && !beContinue) {
        bar.classList.remove("ggantt-suf");
        bar.classList.add("ggantt-pre");
    }
    if (!alreadyStarted && beContinue) {
        bar.classList.remove("ggantt-pre");
        bar.classList.add("ggantt-suf");
    }
    bar.style.width = beContinue ? 100 - barStart + "%" : barDuring + "%";
};

gGantt.createBar = (that, obj, customStart, customEnd) => {
    const { title: name, id } = obj;
    const start = customStart || +new Date(obj.start);
    const end = customEnd || +new Date(obj.end);

    if (start > end) {
        throw new TypeError(
            name + ": 시작 시간은 종료시간 보다 빠를 수 없습니다."
        );
    }

    const bar = gGantt.template.bar.cloneNode();
    // bar.id = `ggantt-${that.id}${id}`;
    gGantt.settingBar(start, end, bar);

    const barSpan = gGantt.createEl("span", "text");
    barSpan.innerHTML = name;
    const toStr = (date) => new Date(date).toLocaleString();
    const str = `${name}: ${toStr(start)} ~ ${toStr(end)}`;
    that.option.showRange && barSpan.append(` ${str}`);
    bar.append(barSpan);

    const labelBind = that.option.labelTemplate
        ? gGantt.htmlReplacer(
              that.option.customKeywords,
              that.option.labelTemplate,
              obj,
              start,
              end
          )
        : name;

    const label = gGantt.createEl("div", "label");
    const labelSpan = gGantt.createEl("span", "text");
    labelSpan.innerHTML = labelBind;
    label.append(labelSpan);

    if (that.option.useTooltip) {
        const tooltipWrap = gGantt.createEl("div", "tooltip");
        const tooltip = gGantt.createEl("div", "dummy");
        tooltipWrap.append(tooltip);
        that.layout.workspace.append(tooltipWrap);

        const tooltipBind = that.option.tooltipTemplate
            ? gGantt.htmlReplacer(
                  that.option.customKeywords,
                  that.option.tooltipTemplate,
                  obj,
                  start,
                  end
              )
            : str;

        const instance = new window.bootstrap.Tooltip(tooltip, {
            offset: "[10, 20]",
            trigger: "manual",
            placement: that.option.tooltipPlacement,
            container: that.layout.workspace,
            html: true,
            title: tooltipBind,
        });
        bar.addEventListener("mouseenter", () => {
            instance.show();
        });
        bar.addEventListener("mousemove", ({ clientX: x, clientY: y }) => {
            tooltipWrap.style.left = window.scrollX + x + "px";
            tooltipWrap.style.top = window.scrollY + y + "px";
            instance.update();
        });

        bar.addEventListener("mouseleave", () => {
            instance.hide();
        });
    }
    that.created.push({ id, bar, start, end });

    return { bar, label };
};

gGantt.createDivider = (that) => {
    that.layout.divider.wrap.append(that.layout.divider.divider);
    const mousemoveEvent = ({ clientX }) => {
        const { x: rootX, width } = that.root.getBoundingClientRect();
        const ratio = {
            label: ((clientX - rootX - 3) / width) * 100,
            bar: ((width - clientX + rootX) / width) * 100,
        };
        if (ratio.bar < 40) {
            that.layout.labels.style.width = "60%";
            that.layout.bars.style.width = "40%";
        } else if (ratio.bar > 95) {
            that.layout.labels.style.width = "5%";
            that.layout.bars.style.width = "95%";
        } else {
            that.layout.labels.style.width = ratio.label + "%";
            that.layout.bars.style.width = ratio.bar + "%";
        }
    };

    that.layout.divider.wrap.addEventListener("mousedown", () => {
        that.root.style.userSelect = "none";
        document.body.addEventListener("mousemove", mousemoveEvent);
        const removeMove = () => {
            document.body.removeEventListener("mousemove", mousemoveEvent);
        };
        that.root.addEventListener("mouseup", () => {
            that.root.style.userSelect = "";
            removeMove();
        });
    });
};

gGantt.htmlReplacer = (customKeywords, source, obj, start, end) => {
    const guide = {
        title: obj.title,
        start,
        startYear: new Date(start).getFullYear(),
        startMonth: new Date(start).getMonth() + 1,
        startDay: new Date(start).getDay(),
        startHour: new Date(start).getHours(),
        startMinute: new Date(start).getMinutes(),
        startSecond: new Date(start).getSeconds(),
        end,
        endYear: new Date(end).getFullYear(),
        endMonth: new Date(end).getMonth() + 1,
        endDay: new Date(end).getDay(),
        endHour: new Date(end).getHours(),
        endMinute: new Date(end).getMinutes(),
        endSecond: new Date(end).getSeconds(),
    };
    if (customKeywords) {
        const keywords = {};
        customKeywords(obj, keywords);
        Object.assign(guide, keywords);
    }
    let newData = source;
    Object.keys(guide).forEach((x) => {
        const regexpString = `@ggantt:${x}@`;
        const regexp = new RegExp(regexpString, "g");
        newData = newData.replace(regexp, guide[x]);
    });
    return newData;
};

gGantt.checkOptions = (option) => {
    const needs = option.useTooltip || option.displayMode === "group";
    const imported =
        typeof window.bootstrap !== "undefined" ||
        typeof bootstrap !== "undefined";
    if (needs && imported) {
        return true;
    } else {
        throw new TypeError("bootstrap.js를 불러오지 못했습니다.");
    }
};

gGantt.bindStatusClass = (created) => {
    const now = +new Date();
    const criteria = {
        running: (obj) => obj.start < now && obj.end > now,
        done: (obj) => obj.start < now && obj.end < now,
        queued: (obj) => obj.start > now,
    };

    Object.keys(criteria).forEach((name) =>
        created
            .filter((obj) => criteria[name](obj))
            .map((obj) => {
                if (![...obj.bar.classList].includes("ggantt-status-" + name))
                    Array.from(obj.bar.classList)
                        .filter((x) => x.startsWith("ggantt-status-"))
                        .map((x) => obj.bar.classList.remove(x));
                obj.bar.classList.add("ggantt-status-" + name);
                obj.status = name;
                return obj;
            })
    );
};

gGantt.hoverGroup = (...els) => {
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

gGantt.getChild = (that, schedule) => {
    let childData = schedule;
    that.option.sortChild &&
        that.option.displayMode !== "compare" &&
        (childData = [...schedule].sort(
            (a, b) => new Date(a.start) - new Date(b.start)
        ));
    return childData.map((child) => {
        const obj = gGantt.createBar(that, child);
        obj.barWrap = gGantt.template.barWrap.cloneNode();
        obj.barWrap.append(obj.bar);
        return obj;
    });
};

gGantt.startTransition = () => {
    setTimeout(() => {
        document
            .querySelectorAll(".pending")
            .forEach((x) => x.classList.remove("pending"));
    }, 100);
};

gGantt.display = {
    group: (that, group) => {
        const earliest = Math.min(
            ...group.schedule.map((item) => +new Date(item.start))
        );
        const latest = Math.max(
            ...group.schedule.map((item) => +new Date(item.end))
        );
        const groupBar = gGantt.createBar(that, group, earliest, latest);
        groupBar.barWrap = gGantt.template.barWrap.cloneNode();
        groupBar.barWrap.append(groupBar.bar);
        [groupBar.label, groupBar.barWrap].forEach((x) => {
            x.setAttribute("data-bs-toggle", "collapse");
            x.setAttribute(
                "data-bs-target",
                `.ggantt-item-${that.id}${group.id}`
            );
            x.setAttribute("role", "button");
        });

        that.layout.bars.append(groupBar.barWrap);
        that.layout.labels.append(groupBar.label);

        gGantt.hoverGroup(groupBar.barWrap, groupBar.label);

        const barCollapse = gGantt.createEl(
            "div",
            `item-${that.id}${group.id}`,
            "collapse"
        );
        const barCollapseInner = gGantt.createEl("div", "collapse-inner");
        const labelCollapse = gGantt.createEl(
            "div",
            `item-${that.id}${group.id}`,
            "collapse"
        );
        const labelCollapseInner = gGantt.createEl("div", "collapse-inner");
        const objs = gGantt.getChild(that, group.schedule);
        Object.keys(objs).forEach((x) =>
            gGantt.hoverGroup(objs[x].label, objs[x].barWrap)
        );

        const bars = objs.map((x) => x.barWrap);
        const labels = objs.map((x) => x.label);

        barCollapseInner.append(...bars);
        labelCollapseInner.append(...labels);

        barCollapse.append(barCollapseInner);
        labelCollapse.append(labelCollapseInner);
        that.layout.bars.append(barCollapse);
        that.layout.labels.append(labelCollapse);
        that.elements.push({
            id: group.id,
            dom: {
                barWrap: groupBar.barWrap,
                label: groupBar.label,
                barCollapse,
                labelCollapse,
            },
        });
    },
    compare: (that, group) => {
        that.root.classList.add("ggantt-compare");
        const earliest = Math.min(
            ...group.schedule.map((item) => +new Date(item.start))
        );
        const latest = Math.max(
            ...group.schedule.map((item) => +new Date(item.end))
        );

        const label = gGantt.createEl("div", "label", "compare");
        const labelBind = that.option.labelTemplate
            ? gGantt.htmlReplacer(
                  that.option.customKeywords,
                  that.option.labelTemplate,
                  group,
                  earliest,
                  latest
              )
            : group.title;
        const labelSpan = gGantt.createEl("span", "text");
        labelSpan.innerHTML = labelBind;
        label.append(labelSpan);

        const objs = gGantt.getChild(that, group.schedule).slice(0, 2);
        Object.keys(objs).forEach((x) =>
            gGantt.hoverGroup(label, objs[x].barWrap)
        );

        const bars = objs.map((x) => x.barWrap);

        that.layout.bars.append(...bars);
        that.layout.labels.append(label);

        const barExports = {
            id: group.id,
            dom: { label },
        };

        [...bars].forEach((bar, index) => {
            barExports.dom[`bar${index}`] = bar;
        });
        that.elements.push(barExports);
    },
    separated: (that, group) => {
        const objs = gGantt.getChild(that, group.schedule);
        Object.keys(objs).forEach((x) =>
            gGantt.hoverGroup(objs[x].label, objs[x].barWrap)
        );

        const bars = objs.map((x) => x.barWrap);
        const labels = objs.map((x) => x.label);

        that.layout.bars.append(...bars);
        that.layout.labels.append(...labels);

        const barExports = {
            id: group.id,
            dom: {},
        };

        [...bars].forEach((bar, index) => {
            barExports.dom[`bar${index}`] = bar;
        });
        [...labels].forEach((bar, index) => {
            barExports.dom[`label${index}`] = bar;
        });
        that.elements.push(barExports);
    },
    queue: (that, group) => {
        const earliest = Math.min(
            ...group.schedule.map((item) => +new Date(item.start))
        );
        const latest = Math.max(
            ...group.schedule.map((item) => +new Date(item.end))
        );
        const label = gGantt.createEl("div", "label");
        const labelBind = that.option.labelTemplate
            ? gGantt.htmlReplacer(
                  that.option.customKeywords,
                  that.option.labelTemplate,
                  group,
                  earliest,
                  latest
              )
            : group.title;
        const labelSpan = gGantt.createEl("span", "text");
        labelSpan.innerHTML = labelBind;
        label.append(labelSpan);

        const objs = group.schedule.map((child) => {
            const obj = gGantt.createBar(that, child);
            return obj.bar;
        });

        const barWrap = gGantt.template.barWrap.cloneNode();
        // barWrap.id = `ggantt-${that.id}${group.id}`;
        barWrap.append(...objs);

        that.layout.bars.append(barWrap);
        that.layout.labels.append(label);

        gGantt.hoverGroup(label, barWrap);

        that.elements.push({
            id: group.id,
            dom: { barWrap, label },
        });
    },
};
gGantt.Chart = class {
    option = { ...gGantt.option };

    constructor(root, data, userOption) {
        this.root = root;
        this.data = data.filter((x) => x.schedule.length);
        this.id = Math.random().toString().substring(2, 8);

        Object.assign(this.option, userOption);
        gGantt.checkOptions(this.option) &&
            this.option.autoInitialize &&
            this.init(userOption);
    }

    created = [];
    elements = [];

    scrollIntoX = (percent) => {
        const { scrollWidth: outer, clientWidth: inner } = this.layout.bars;
        this.layout.bars.scrollLeft = (outer - inner) * percent;
    };

    init = () => {
        this.layout = {
            labels: gGantt.createEl("div", "label-area"),
            divider: {
                wrap: gGantt.createEl("div", "divider-wrap"),
                divider: gGantt.createEl("div", "divider"),
            },
            bars: gGantt.createEl("div", "bar-area"),
            tick: {
                wrap: gGantt.createEl("div", "tick-wrap"),
                ticks: [...Array(this.option.timeDivision)].map((x, index) => {
                    x = gGantt.createEl("div", "tick");
                    const span = gGantt.createEl("span", "text");
                    span.innerHTML =
                        (24 / this.option.timeDivision) * (index + 1);
                    x.append(span);
                    return x;
                }),
            },
            timeline: {
                wrap: gGantt.createEl("div", "timeline-wrap"),
                inner: gGantt.createEl("div", "timeline-inner"),
                timeline: gGantt.createEl("div", "timeline"),
            },
            cursor: gGantt.createEl("div", "cursor"),
            workspace: gGantt.createEl("div", "workspace"),
        };

        this.root.classList.add("ggantt");
        this.option.useRowBorder &&
            this.root.classList.add("ggantt-row-border");

        const idChecks = [];
        const data = this.data.filter((group) => {
            const starts = group.schedule
                .map((x) => +new Date(x.start))
                .filter((x) => x < gGantt.nextMidnight);
            const ends = group.schedule
                .map((x) => +new Date(x.end))
                .filter((x) => x > gGantt.lastMidnight);
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
            const fieldName = gGantt.createEl("div", "field");
            const span = gGantt.createEl("span", "text");
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
            const voidStatus = gGantt.createEl("div", "void");
            voidStatus.innerHTML = "표시할 내용이 없습니다.";
            this.root.append(voidStatus);
            this.root.classList.add("ggantt-no-contents");
        }

        data.forEach((group) =>
            gGantt.display[this.option.displayMode](this, group)
        );

        gGantt.startTransition();

        const timelineFunc = () => {
            this.layout.timeline.wrap.append(this.layout.timeline.timeline);
            const now = +new Date();
            const currentTime = now - gGantt.lastMidnight;
            const timelinePos = currentTime / gGantt.dayTime;
            this.layout.timeline.timeline.style.left = timelinePos * 100 + "%";
            return timelinePos;
        };

        gGantt.bindStatusClass(this.created);

        if (this.option.useTimeline) {
            const pos = timelineFunc();
            this.timelineInterval = setInterval(timelineFunc, 1000);
            this.scrollIntoX(pos);
        }
        this.option.useDivider && gGantt.createDivider(this);
    };

    removeGroup = (id) => {
        const target = this.elements.find((el) => el.id === id);
        Object.keys(target.dom).forEach((x) => {
            const element = target.dom[x];
            const bars = element.querySelectorAll(".ggantt-bar");
            [...bars].forEach((bar) => {
                bar.classList.add("removing");
            });
            setTimeout(() => element.remove(), 500);
        });
        this.data = this.data.filter((x) => x.id !== id);
        this.created = this.created.filter((x) => x.id !== id);
        this.elements = this.elements.filter((x) => x.id !== id);
    };

    updateAll = (inputData) => {
        const newData = inputData.filter((x) => x.schedule.length);
        const existDataIds = this.data.map(({ id }) => id);
        const newDataIds = newData.map(({ id }) => id);
        newData
            .filter(({ id }) => !existDataIds.includes(id))
            .forEach((group) => {
                gGantt.display[this.option.displayMode](this, group);
                this.data.push(group);
            });

        this.data
            .filter(({ id }) => !newDataIds.includes(id))
            .forEach((group) => this.removeGroup(group.id));

        newData
            .filter(({ id }) => existDataIds.includes(id))
            .forEach((group) => {
                group.schedule.forEach((x) => {
                    const target = this.created.find(({ id }) => id === x.id);
                    if (target) {
                        const start = +new Date(target.start);
                        const end = +new Date(target.end);
                        const isChanged =
                            target.start !== start || target.end !== end;
                        isChanged && gGantt.settingBar(start, end, target.bar);
                    } else {
                        const obj = gGantt.createBar(this, x);
                        if (this.option.displayMode === "group") {
                            obj.barWrap = gGantt.template.barWrap.cloneNode();
                            obj.barWrap.append(obj.bar);
                            const groupTarget = this.elements.find(
                                ({ id }) => id === group.id
                            ).dom;
                            groupTarget.barCollapse.append(obj.barWrap);
                            groupTarget.labelCollapse.append(obj.label);
                        }
                    }
                });
            });

        gGantt.startTransition();
        gGantt.bindStatusClass(this.created);
    };
};

window.gGantt = gGantt;
export default gGantt;
