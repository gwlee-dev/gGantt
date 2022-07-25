import { constant } from "./_default";

export const settingBar = (start, end, bar) => {
    const alreadyStarted = start < constant.lastMidnight;
    const beContinue = end > constant.nextMidnight;
    let dueOffset = 0;
    alreadyStarted && (dueOffset = constant.lastMidnight - start);
    const barDuring = ((end - start - dueOffset) / constant.dayTime) * 100;
    const barStart = ((start - constant.lastMidnight) / constant.dayTime) * 100;

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

export const bindStatusClass = (storage) => {
    const now = +new Date();
    const criteria = {
        running: (obj) => obj.start < now && obj.end > now,
        done: (obj) => obj.start < now && obj.end < now,
        queued: (obj) => obj.start > now,
    };

    Object.keys(criteria).forEach((name) =>
        Object.keys(storage)
            .map((x) => storage[x])
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

export const htmlReplacer = (customKeywords, source, obj, start, end) => {
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
