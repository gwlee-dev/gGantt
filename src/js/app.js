import { sampleData } from "./sampledata";

export const gGantt = {
    Chart: class {
        constructor(root, noAutoInitialize) {
            const createDiv = (mainClass, ...className) => {
                const element = document.createElement("div");
                element.className = `ggantt-${mainClass}`;
                element.classList.add(...className);
                return element;
            };
            this.lastMidnight = +new Date().setHours(0, 0, 0, 0);
            this.nextMidnight = +new Date().setHours(24, 0, 0, 0);
            this.dayTime = 86400000;
            this.root = root;
            this.layout = {
                labels: createDiv("label-area", "col", "col-3", "flex-nowrap"),
                bars: createDiv("bar-area", "col", "col-9", "overflow-auto"),
                grad: {
                    wrap: createDiv(
                        "label-area",
                        "row",
                        "g-0",
                        "flex-nowrap",
                        "mb-2"
                    ),
                    ticks: [...Array(24)].map((x, index) => {
                        x = createDiv(
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
            this.template = {
                label: createDiv("label"),
                barWrap: createDiv("bar-wrap", "d-flex", "w-100"),
                bar: createDiv(
                    "bar",
                    "rounded",
                    "text-white",
                    "fw-bold",
                    "ps-2",
                    "bg-primary",
                    "text-truncate"
                ),
            };
            this.data = sampleData;
            this.init = () => {
                const { root, layout } = this;
                root.className = "row";
                const fieldName = createDiv(
                    "field",
                    "w-100",
                    "fw-bold",
                    "mb-2"
                );
                fieldName.innerHTML = "데이터명";
                layout.labels.append(fieldName);
                layout.grad.wrap.append(...layout.grad.ticks);
                layout.bars.append(layout.grad.wrap);
                root.append(layout.labels, layout.bars);
                this.update();
            };
            this.createBar = (name, start, end) => {
                const alreadyStarted = start < this.lastMidnight;
                let dueOffset = 0;
                alreadyStarted && (dueOffset = this.lastMidnight - start);
                const barDuring =
                    ((end - start - dueOffset) / this.dayTime) * 100;
                const barStart =
                    ((start - this.lastMidnight) / this.dayTime) * 100;

                const barWrap = this.template.barWrap.cloneNode();
                const bar = this.template.bar.cloneNode();

                !alreadyStarted && (bar.style.marginLeft = barStart + "%");
                bar.style.width = barDuring + "%";
                bar.innerHTML = name;

                barWrap.append(bar);
                this.layout.bars.append(barWrap);
            };
            this.update = () => {
                const { data, layout, template } = this;

                data.filter((group) => {
                    const starts = group.schedule
                        .map((x) => +new Date(x.start))
                        .filter((x) => x < this.nextMidnight);
                    const ends = group.schedule
                        .map((x) => +new Date(x.end))
                        .filter((x) => x > this.lastMidnight);
                    return !!starts.length && !!ends.length;
                }).forEach((group) => {
                    const label = template.label.cloneNode();
                    label.innerHTML = group.title;
                    layout.labels.append(label);
                    const earliest = Math.min(
                        ...group.schedule.map((item) => +new Date(item.start))
                    );
                    const latest = Math.max(
                        ...group.schedule.map((item) => +new Date(item.end))
                    );
                    this.createBar(
                        `${group.title} (${new Date(
                            earliest
                        ).toLocaleString()} ~ ${new Date(
                            latest
                        ).toLocaleString()})`,
                        earliest,
                        latest
                    );
                });
            };

            !noAutoInitialize && this.init();
        }
    },
};

const sampleEl = document.querySelector("#ggantt-sample");
const sample = new gGantt.Chart(sampleEl);
// console.log(sample);
(() => (window.gGantt = gGantt))();
export default gGantt;
