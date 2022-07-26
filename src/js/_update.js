import { bindStatusClass, settingBar } from "./_bind";
import { template } from "./_default";
import { display } from "./_display";
import { createBar } from "./_dom";
import { startTransition } from "./_tool";

export const updater = (inputData, that) => {
    const filtered = inputData.filter((x) => typeof x.schedule !== "undefined");
    const groups = Object.keys(filtered).map((x) => filtered[x].id);
    const existGroups = Object.keys(that.data).map((x) => that.data[x].id);
    const groupAddIds = groups.filter((x) => !existGroups.includes(x));
    const groupRemoveIds = existGroups.filter((x) => !groups.includes(x));
    const groupRemainingIds = groups.filter((x) => existGroups.includes(x));

    groupAddIds.forEach((x) => {
        const target = filtered.find(({ id }) => id === x);
        display[that.option.displayMode](that, target);
    });

    groupRemoveIds.forEach((x) => {
        Object.keys(that.storage)
            .filter((key) => that.storage[key].parent === x)
            .forEach((key) =>
                that.storage[key].dom.bar.classList.add("removing")
            );
        setTimeout(() => {
            Object.keys(that.storage[x].dom).forEach((key) => {
                that.storage[x].dom[key].remove();
            });
            delete that.storage[x];
        }, 500);
    });

    groupRemainingIds.forEach((groupId) => {
        const oldData = that.data.find((x) => x.id === groupId);
        const newData = filtered.find((x) => x.id === groupId);

        const newDataIds = newData.schedule.map((x) => x.id);

        oldData.schedule
            .filter(({ id }) => !newDataIds.includes(id))
            .forEach(({ id }) => {
                const { dom } = that.storage[id];
                dom.bar.classList.add("removing");
                setTimeout(() => {
                    Object.keys(dom).forEach((x) => {
                        removeSchedule[that.option.displayMode](
                            dom,
                            x,
                            this,
                            groupId
                        );
                    });
                }, 500);
                delete that.storage[id];
            });

        newData.schedule.forEach((obj) => {
            const old = oldData.schedule.find((x) => x.id === obj.id);
            if (typeof old === "undefined") {
                newSchedule[that.option.displayMode](
                    that,
                    obj,
                    groupId,
                    newData
                );
            } else {
                const el = that.storage[obj.id].dom.bar;
                obj.start !== old.start ||
                    (obj.end !== old.end &&
                        settingBar(
                            +new Date(obj.start),
                            +new Date(obj.end),
                            el
                        ));
            }
        });
    });

    that.data = filtered;
    bindStatusClass(that.storage);
    startTransition();
};

const newSchedule = {
    group: (that, obj, groupId, newData) => {
        settingGroupBar(that, groupId, newData);
        const { bar, label } = createBar(that, obj, groupId);
        const barWrap = template.barWrap.cloneNode();
        barWrap.append(bar);
        that.storage[groupId].dom.barCollapseInner.append(barWrap);
        that.storage[groupId].dom.labelCollapseInner.append(label);
    },
    compare: (that, obj, groupId) => {
        const { bar } = createBar(that, obj, groupId);
        const firstBar = that.storage[groupId].dom.bar0;
        const secondBar = that.storage[groupId].dom.bar1;
        if (firstBar.innerHTML === "") {
            return firstBar.append(bar);
        }
        if (secondBar.innerHTML === "") {
            secondBar.append(bar);
        }
    },
    separated: (that, obj, groupId) => {
        const { bar, label } = createBar(that, obj, groupId);
        const barWrap = template.barWrap.cloneNode();
        barWrap.append(bar);
        that.layout.bars.append(barWrap);
        that.layout.labels.append(label);
    },
    queue: (that, obj, groupId) => {
        const { bar } = createBar(that, obj, groupId);
        that.storage[groupId].dom.barWrap.append(bar);
    },
};

const removeSchedule = {
    group: (array, index, groupProperties) => {
        const { that, groupId, newData } = groupProperties;
        settingGroupBar(that, groupId, newData);
        index === "bar" && array[index].parentNode.remove();
        array[index].remove();
    },
    compare: (array, index) => {
        array[index].remove();
    },
    separated: (array, index) => {
        index === "bar" && array[index].parentNode.remove();
        array[index].remove();
    },
    queue: (array, index) => {
        array[index].remove();
    },
};

const settingGroupBar = (that, groupId, newData) => {
    const groupBar = that.storage[groupId].dom.bar;
    const earliest = Math.min(
        ...newData.schedule.map((item) => +new Date(item.start))
    );
    const latest = Math.max(
        ...newData.schedule.map((item) => +new Date(item.end))
    );
    that.storage[groupId].start = earliest;
    that.storage[groupId].end = latest;
    settingBar(earliest, latest, groupBar);
};
