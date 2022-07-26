import { htmlReplacer } from "./_bind";
import { template } from "./_default";
import { createBar, getChild } from "./_dom";
import { hoverGroup } from "./_event";
import { createEl } from "./_tool";

export const display = {
    group: (that, group) => {
        const earliest = Math.min(
            ...group.schedule.map((item) => +new Date(item.start))
        );
        const latest = Math.max(
            ...group.schedule.map((item) => +new Date(item.end))
        );
        const groupBar = createBar(that, {
            start: earliest,
            end: latest,
            ...group,
        });
        groupBar.barWrap = template.barWrap.cloneNode();
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

        hoverGroup(groupBar.barWrap, groupBar.label);

        const barCollapse = createEl(
            "div",
            `item-${that.id}${group.id}`,
            "collapse"
        );
        const barCollapseInner = createEl("div", "collapse-inner");
        const labelCollapse = createEl(
            "div",
            `item-${that.id}${group.id}`,
            "collapse"
        );
        const labelCollapseInner = createEl("div", "collapse-inner");
        const objs = getChild(that, group);
        Object.keys(objs).forEach((x) =>
            hoverGroup(objs[x].label, objs[x].barWrap)
        );

        const bars = objs.map((x) => x.barWrap);
        const labels = objs.map((x) => x.label);

        barCollapseInner.append(...bars);
        labelCollapseInner.append(...labels);

        barCollapse.append(barCollapseInner);
        labelCollapse.append(labelCollapseInner);
        that.layout.bars.append(barCollapse);
        that.layout.labels.append(labelCollapse);

        Object.assign(that.storage[group.id].dom, {
            barWrap: groupBar.barWrap,
            label: groupBar.label,
            barCollapse,
            labelCollapse,
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

        const label = createEl("div", "label", "compare");
        const labelBind = that.option.labelTemplate
            ? htmlReplacer(
                  that.option.customKeywords,
                  that.option.labelTemplate,
                  group,
                  earliest,
                  latest
              )
            : group.title;
        const labelSpan = createEl("span", "text");
        labelSpan.innerHTML = labelBind;
        label.append(labelSpan);

        const objs = getChild(that, group).slice(0, 2);
        Object.keys(objs).forEach((x) => hoverGroup(label, objs[x].barWrap));

        const bars = objs.map((x) => x.barWrap);

        that.layout.bars.append(...bars);
        that.layout.labels.append(label);

        that.storage[group.id] = { dom: { label } };
        [...bars].forEach((bar, index) => {
            that.storage[group.id][`bar${index}`] = bar;
        });
    },
    separated: (that, group) => {
        const objs = getChild(that, group);
        Object.keys(objs).forEach((x) =>
            hoverGroup(objs[x].label, objs[x].barWrap)
        );

        const bars = objs.map((x) => x.barWrap);
        const labels = objs.map((x) => x.label);

        that.layout.bars.append(...bars);
        that.layout.labels.append(...labels);

        that.storage[group.id] = { dom: {} };

        [...bars].forEach((bar, index) => {
            that.storage[group.id].dom[`bar${index}`] = bar;
        });
        [...labels].forEach((bar, index) => {
            that.storage[group.id].dom[`label${index}`] = bar;
        });
    },
    queue: (that, group) => {
        const earliest = Math.min(
            ...group.schedule.map((item) => +new Date(item.start))
        );
        const latest = Math.max(
            ...group.schedule.map((item) => +new Date(item.end))
        );
        const label = createEl("div", "label");
        const labelBind = that.option.labelTemplate
            ? htmlReplacer(
                  that.option.customKeywords,
                  that.option.labelTemplate,
                  group,
                  earliest,
                  latest
              )
            : group.title;
        const labelSpan = createEl("span", "text");
        labelSpan.innerHTML = labelBind;
        label.append(labelSpan);

        const objs = group.schedule.map((child) => {
            const obj = createBar(that, child, group);
            return obj.bar;
        });

        const barWrap = template.barWrap.cloneNode();
        barWrap.append(...objs);

        that.layout.bars.append(barWrap);
        that.layout.labels.append(label);

        hoverGroup(label, barWrap);

        that.storage[group.id] = {
            dom: {
                barWrap,
                label,
            },
        };
    },
};
