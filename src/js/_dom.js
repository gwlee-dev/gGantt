import { htmlReplacer, settingBar } from "./_bind";
import { template } from "./_default";
import { createEl } from "./_tool";

export const createBar = (that, obj, parent) => {
    const { title: name, id } = obj;
    const start = +new Date(obj.start);
    const end = +new Date(obj.end);

    if (start > end) {
        throw new TypeError(
            name + ": 시작 시간은 종료시간 보다 빠를 수 없습니다."
        );
    }

    const bar = template.bar.cloneNode();
    settingBar(start, end, bar);

    const barSpan = createEl("span", "text");
    barSpan.innerHTML = name;
    const toStr = (date) => new Date(date).toLocaleString();
    const str = `${name}: ${toStr(start)} ~ ${toStr(end)}`;
    that.option.showRange && barSpan.append(` ${str}`);
    bar.append(barSpan);

    const labelBind = that.option.labelTemplate
        ? htmlReplacer(
              that.option.customKeywords,
              that.option.labelTemplate,
              obj,
              start,
              end
          )
        : name;

    const label = createEl("div", "label");
    const labelSpan = createEl("span", "text");
    labelSpan.innerHTML = labelBind;
    label.append(labelSpan);

    if (that.option.useTooltip) {
        const tooltipWrap = createEl("div", "tooltip");
        const tooltip = createEl("div", "dummy");
        tooltipWrap.append(tooltip);
        that.layout.workspace.append(tooltipWrap);

        const tooltipBind = that.option.tooltipTemplate
            ? htmlReplacer(
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
    that.storage[id] = { dom: { bar, label }, start, end };
    // console.log(that.storage[id]);
    parent && (that.storage[id].parent = parent);

    return { bar, label };
};

export const createDivider = (that) => {
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

export const getChild = (that, group) => {
    let childData = group.schedule;
    that.option.sortChild &&
        that.option.displayMode !== "compare" &&
        (childData = [...group.schedule].sort(
            (a, b) => new Date(a.start) - new Date(b.start)
        ));
    const genData = childData.map((child) => {
        const obj = createBar(that, child, group.id);
        obj.barWrap = template.barWrap.cloneNode();
        obj.barWrap.append(obj.bar);
        return obj;
    });
    return genData;
};
