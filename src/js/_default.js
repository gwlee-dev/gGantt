export const option = {
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
};

export const constant = {
    lastMidnight: +new Date().setHours(0, 0, 0, 0),
    nextMidnight: +new Date().setHours(24, 0, 0, 0),
    dayTime: 86400000,
};
