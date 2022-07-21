export const gGantt = {
    lastMidnight: +new Date().setHours(0, 0, 0, 0),
    nextMidnight: +new Date().setHours(24, 0, 0, 0),
    dayTime: 86400000,
    createEl: (tag, mainClass, ...className) => {
        const element = document.createElement(tag);
        element.className = `ggantt-${mainClass}`;
        element.classList.add(...className);
        return element;
    },
    createBar: (that, obj, customStart, customEnd) => {
        const { title: name, id } = obj;
        const start = customStart || +new Date(obj.start);
        const end = customEnd || +new Date(obj.end);

        if (start > end) {
            throw new TypeError(
                name + ": 시작 시간은 종료시간 보다 빠를 수 없습니다."
            );
        }

        const alreadyStarted = start < gGantt.lastMidnight;
        const beContinue = end > gGantt.nextMidnight;
        let dueOffset = 0;
        alreadyStarted && (dueOffset = gGantt.lastMidnight - start);
        const barDuring = ((end - start - dueOffset) / gGantt.dayTime) * 100;
        const barStart = ((start - gGantt.lastMidnight) / gGantt.dayTime) * 100;

        const bar = that.template.bar.cloneNode();
        bar.id = `ggantt-${that.id}${id}`;

        !alreadyStarted && (bar.style.left = barStart + "%");
        alreadyStarted && !beContinue && bar.classList.add("ggantt-pre");
        !alreadyStarted && beContinue && bar.classList.add("ggantt-suf");
        bar.style.width = beContinue ? 100 - barStart + "%" : barDuring + "%";
        const barSpan = gGantt.createEl("span", "text");
        barSpan.innerHTML = name;
        bar.append(barSpan);
        const toStr = (date) => new Date(date).toLocaleString();
        const str = `${name}: ${toStr(start)} ~ ${toStr(end)}`;
        that.option.showRange && bar.append(` ${str}`);

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
            if (typeof window.bootstrap !== "undefined") {
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
                bar.addEventListener(
                    "mousemove",
                    ({ clientX: x, clientY: y }) => {
                        tooltipWrap.style.left = window.scrollX + x + "px";
                        tooltipWrap.style.top = window.scrollY + y + "px";
                        instance.update();
                    }
                );

                bar.addEventListener("mouseleave", () => {
                    instance.hide();
                });
            } else {
                throw new TypeError(
                    "부트스트랩이 로드되지 않았습니다. 부트스트랩을 import 하거나 해당 옵션을 비활성화 하세요."
                );
            }
        }
        that.created.push({ bar, start, end });

        return { bar, label };
    },
    htmlReplacer: (customKeywords, source, obj, start, end) => {
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
    },
    Chart: class {
        option = {
            autoInitialize: true,
            displayMode: "group",
            showRange: false,
            useTooltip: true,
            tooltipPlacement: "bottom",
            useTimeline: true,
            useDivider: true,
            tooltipTemplate: false,
            labelTemplate: false,
            fieldTitle: "데이터명",
            sortChild: true,
            useCursor: true,
            timeDivision: 24,
            useRowBorder: true,
            customKeywords: false,
        };

        constructor(root, data, userOption) {
            this.root = root;
            this.data = data;
            this.id = Math.random().toString().substring(2, 8);

            userOption &&
                Object.keys(this.option).forEach((x) => {
                    x in userOption && (this.option[x] = userOption[x]);
                });
            this.option.autoInitialize && this.init(userOption);
        }

        template = {
            barWrap: gGantt.createEl("div", "bar-wrap"),
            bar: gGantt.createEl("div", "bar", "pending"),
        };

        created = [];

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
                    ticks: [...Array(this.option.timeDivision)].map(
                        (x, index) => {
                            x = gGantt.createEl("div", "tick");
                            const span = gGantt.createEl("span", "text");
                            span.innerHTML =
                                (24 / this.option.timeDivision) * (index + 1);
                            x.append(span);
                            return x;
                        }
                    ),
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

            if (data.length) {
                const fieldName = gGantt.createEl("div", "field");
                const span = gGantt.createEl("span", "text");
                span.innerHTML = this.option.fieldTitle;
                fieldName.append(span);

                this.layout.divider.wrap.append(this.layout.divider.divider);

                document.body.append(this.layout.workspace);
                this.layout.bars.append(
                    this.layout.timeline.wrap,
                    this.layout.cursor
                );
                this.layout.labels.append(fieldName);
                this.layout.tick.wrap.append(...this.layout.tick.ticks);
                this.layout.bars.append(this.layout.tick.wrap);
                this.root.append(this.layout.labels);
                this.option.useDivider &&
                    this.root.append(this.layout.divider.wrap);
                this.root.append(this.layout.bars);
                this.option.useCursor &&
                    (() => {
                        const cursorFunc = ({ clientX }) => {
                            const { x } =
                                this.layout.bars.getBoundingClientRect();
                            this.layout.cursor.style.left = clientX - x + "px";
                        };

                        this.layout.bars.addEventListener("mouseenter", () => {
                            this.layout.cursor.classList.add("show");
                            this.root.addEventListener("mousemove", cursorFunc);
                        });

                        this.layout.bars.addEventListener("mouseleave", () => {
                            this.layout.cursor.classList.remove("show");
                            this.root.removeEventListener(
                                "mousemove",
                                cursorFunc
                            );
                        });
                    })();
            } else {
                const voidStatus = gGantt.createEl("div", "void");
                voidStatus.innerHTML = "표시할 내용이 없습니다.";
                this.root.append(voidStatus);
                this.root.classList.add("ggantt-no-contents");
            }

            const dividerFunc = () => {
                const mousemoveEvent = ({ clientX }) => {
                    const { x: rootX, width } =
                        this.root.getBoundingClientRect();
                    const ratio = {
                        label: ((clientX - rootX - 3) / width) * 100,
                        bar: ((width - clientX + rootX) / width) * 100,
                    };
                    if (ratio.bar < 40) {
                        this.layout.labels.style.width = "60%";
                        this.layout.bars.style.width = "40%";
                    } else if (ratio.bar > 95) {
                        this.layout.labels.style.width = "5%";
                        this.layout.bars.style.width = "95%";
                    } else {
                        this.layout.labels.style.width = ratio.label + "%";
                        this.layout.bars.style.width = ratio.bar + "%";
                    }
                };

                this.layout.divider.wrap.addEventListener("mousedown", () => {
                    this.root.style.userSelect = "none";
                    document.body.addEventListener("mousemove", mousemoveEvent);
                    const removeMove = () => {
                        document.body.removeEventListener(
                            "mousemove",
                            mousemoveEvent
                        );
                    };
                    this.root.addEventListener("mouseup", () => {
                        this.root.style.userSelect = "";
                        removeMove();
                    });
                });
            };

            const getChild = (schedule) => {
                let childData = schedule;
                this.option.sortChild &&
                    this.option.displayMode !== "compare" &&
                    (childData = [...schedule].sort(
                        (a, b) => new Date(a.start) - new Date(b.start)
                    ));
                return childData.map((child) => {
                    const obj = gGantt.createBar(this, child);
                    obj.barWrap = this.template.barWrap.cloneNode();
                    obj.barWrap.append(obj.bar);
                    return obj;
                });
            };

            const hoverSet = (...els) => {
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

            if (this.option.displayMode === "group") {
                if (typeof window.bootstrap !== "undefined") {
                    data.forEach((group) => {
                        const earliest = Math.min(
                            ...group.schedule.map(
                                (item) => +new Date(item.start)
                            )
                        );
                        const latest = Math.max(
                            ...group.schedule.map((item) => +new Date(item.end))
                        );
                        const groupBar = gGantt.createBar(
                            this,
                            group,
                            earliest,
                            latest
                        );
                        groupBar.barWrap = this.template.barWrap.cloneNode();
                        groupBar.barWrap.id = `ggantt-group-${this.id}${group.id}`;
                        groupBar.barWrap.append(groupBar.bar);

                        [groupBar.label, groupBar.barWrap].forEach((x) => {
                            x.setAttribute("data-bs-toggle", "collapse");
                            x.setAttribute(
                                "data-bs-target",
                                `.ggantt-item-${this.id}${group.id}`
                            );
                            x.setAttribute("role", "button");
                        });

                        this.layout.bars.append(groupBar.barWrap);
                        this.layout.labels.append(groupBar.label);

                        hoverSet(groupBar.barWrap, groupBar.label);

                        const barCollapse = gGantt.createEl(
                            "div",
                            `item-${this.id}${group.id}`,
                            "collapse"
                        );
                        const barCollapseInner = gGantt.createEl(
                            "div",
                            "collapse-inner"
                        );
                        const labelCollapse = gGantt.createEl(
                            "div",
                            `item-${this.id}${group.id}`,
                            "collapse"
                        );
                        const labelCollapseInner = gGantt.createEl(
                            "div",
                            "collapse-inner"
                        );
                        const objs = getChild(group.schedule);
                        Object.keys(objs).forEach((x) =>
                            hoverSet(objs[x].label, objs[x].barWrap)
                        );

                        const bars = objs.map((x) => x.barWrap);
                        const labels = objs.map((x) => x.label);

                        barCollapseInner.append(...bars);
                        labelCollapseInner.append(...labels);

                        barCollapse.append(barCollapseInner);
                        labelCollapse.append(labelCollapseInner);

                        this.layout.bars.append(barCollapse);
                        this.layout.labels.append(labelCollapse);
                    });
                } else {
                    throw new TypeError(
                        "부트스트랩이 로드되지 않았습니다. 부트스트랩을 import 하거나 해당 옵션을 비활성화 하세요."
                    );
                }
            }

            if (this.option.displayMode === "compare") {
                data.forEach((group) => {
                    this.root.classList.add("ggantt-compare");
                    const earliest = Math.min(
                        ...group.schedule.map((item) => +new Date(item.start))
                    );
                    const latest = Math.max(
                        ...group.schedule.map((item) => +new Date(item.end))
                    );

                    const label = gGantt.createEl("div", "label", "compare");
                    const labelBind = this.option.labelTemplate
                        ? gGantt.htmlReplacer(
                              this.option.customKeywords,
                              this.option.labelTemplate,
                              group,
                              earliest,
                              latest
                          )
                        : group.title;
                    const labelSpan = gGantt.createEl("span", "text");
                    labelSpan.innerHTML = labelBind;
                    label.append(labelSpan);

                    const objs = getChild(group.schedule).slice(0, 2);
                    Object.keys(objs).forEach((x) =>
                        hoverSet(label, objs[x].barWrap)
                    );

                    const bars = objs.map((x) => x.barWrap);
                    // const labels = objs.map((x) => x.label);

                    this.layout.bars.append(...bars);
                    this.layout.labels.append(label);
                });
            }

            if (this.option.displayMode === "separated") {
                data.forEach((group) => {
                    const objs = getChild(group.schedule);
                    Object.keys(objs).forEach((x) =>
                        hoverSet(objs[x].label, objs[x].barWrap)
                    );

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
                        ? gGantt.htmlReplacer(
                              this.option.customKeywords,
                              this.option.labelTemplate,
                              group,
                              earliest,
                              latest
                          )
                        : group.title;
                    const labelSpan = gGantt.createEl("span", "text");
                    labelSpan.innerHTML = labelBind;
                    label.append(labelSpan);

                    const objs = group.schedule.map((child) => {
                        const obj = gGantt.createBar(this, child);
                        return obj.bar;
                    });

                    const barWrap = this.template.barWrap.cloneNode();
                    barWrap.id = `ggantt-${this.id}${group.id}`;
                    barWrap.append(...objs);

                    this.layout.bars.append(barWrap);
                    this.layout.labels.append(label);

                    hoverSet(label, barWrap);
                });
            }

            setTimeout(() => {
                document
                    .querySelectorAll(".pending")
                    .forEach((x) => x.classList.remove("pending"));
            }, 0);

            const timelineFunc = () => {
                this.layout.timeline.wrap.append(this.layout.timeline.timeline);
                const now = +new Date();
                const currentTime = now - gGantt.lastMidnight;
                this.timelinePos = currentTime / gGantt.dayTime;
                this.layout.timeline.timeline.style.left =
                    this.timelinePos * 100 + "%";
            };

            const bindClass = (arr, stat) => {
                return arr.map((obj) => {
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

            const bind = () => {
                const now = +new Date();
                this.running = bindClass(
                    this.created.filter(
                        (obj) => obj.start < now && obj.end > now
                    ),
                    "running"
                );
                this.done = bindClass(
                    this.created.filter(
                        (obj) => obj.start < now && obj.end < now
                    ),
                    "done"
                );
                this.queued = bindClass(
                    this.created.filter((obj) => obj.start > now),
                    "queued"
                );
            };

            bind();

            if (this.option.useTimeline) {
                timelineFunc();
                this.timelineInterval = setInterval(timelineFunc, 1000);

                const { scrollWidth: outer, clientWidth: inner } =
                    this.layout.bars;
                this.layout.bars.scrollLeft =
                    (outer - inner) * this.timelinePos;
            }
            this.option.useDivider && dividerFunc();
        };
    },
};

window.gGantt = gGantt;
export default gGantt;
