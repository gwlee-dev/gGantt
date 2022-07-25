import { settingBar } from "./_bind";
import { createBar } from "./_dom";
import { createEl } from "./_tool";

export const update = {
    group: {
        modify: (that, group) => {
            const earliest = Math.min(
                ...group.schedule.map((item) => +new Date(item.start))
            );
            const latest = Math.max(
                ...group.schedule.map((item) => +new Date(item.end))
            );
            const { bar: groupBar } = that.created.find(
                ({ id }) => id === group.id
            );
            settingBar(earliest, latest, groupBar);
            group.schedule.forEach((x) => {
                const target = that.created.find(({ id }) => id === x.id);
                if (target) {
                    const newStart = new Date(x.start);
                    const newEnd = new Date(x.end);
                    settingBar(newStart, newEnd, target.bar);
                    target.start = newStart;
                    target.end = newEnd;
                } else {
                    const obj = createBar(that, x);
                    const barWrap = createEl("div", "bar-wrap");
                    barWrap.append(obj.bar);
                    const {
                        dom: { barCollapse, labelCollapse },
                    } = that.elements.find(({ id }) => id === group.id);
                    barCollapse
                        .querySelector(".ggantt-collapse-inner")
                        .append(barWrap);
                    labelCollapse.append(obj.label);
                }
            });
        },
        remove: (that, group, data) => {
            const newScheduleIds = data
                .find(({ id }) => id === group.id)
                .schedule.map((x) => x.id);
            group.schedule
                .filter(({ id }) => !newScheduleIds.includes(id))
                .forEach((x) => {
                    const { bar, label } = that.created.find(
                        ({ id }) => id === x.id
                    );
                    bar.classList.add("removing");
                    setTimeout(() => {
                        bar.parentNode.remove();
                        label.remove();
                    }, 500);
                    that.created = that.created.filter(({ id }) => id !== x.id);
                });
        },
    },
    queue: {
        modify: (that, group) => {
            group.schedule.forEach((x) => {
                const target = that.created.find(({ id }) => id === x.id);
                if (target) {
                    const newStart = new Date(x.start);
                    const newEnd = new Date(x.end);
                    settingBar(newStart, newEnd, target.bar);
                    target.start = newStart;
                    target.end = newEnd;
                } else {
                    const obj = createBar(that, x);
                    const {
                        dom: { barWrap },
                    } = that.elements.find(({ id }) => id === group.id);
                    barWrap.append(obj.bar);
                }
            });
        },
        remove: (that, group, data) => {
            const newScheduleIds = data
                .find(({ id }) => id === group.id)
                .schedule.map((x) => x.id);
            group.schedule
                .filter(({ id }) => !newScheduleIds.includes(id))
                .forEach((x) => {
                    const { bar } = that.created.find(({ id }) => id === x.id);
                    bar.classList.add("removing");
                    setTimeout(() => bar.remove(), 500);
                    that.created = that.created.filter(({ id }) => id !== x.id);
                });
        },
    },
};
