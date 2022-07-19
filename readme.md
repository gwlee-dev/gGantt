**gGantt**

Usage

    const chartObj = new gGantt.Chart(rootElement, Data, Options)

Method

    chartObj.init()

Options

    autoInitialize: (true || false), // 기본값: true
    displayMode: ("queue" || "group" || "separated"), // 기본값: "group"
    showRange: (true || false), // 기본값: false
    useTooltip: (true || false), // 기본값: true
    tooltipPlacement: ("top" || "bottom"), // 기본값: bottom
    useTimeline: (true || false), // 기본값: true
    useDivider: true, // 기본값: true
    tooltipTemplate: ("HTML String" || false), // 기본값: false
    labelTemplate: ("HTML String" || false), // 기본값: false
    fieldTitle: ("HTML String"), // 기본값: "데이터명"
    sortChild: (true || false), // 기본값: true
    useCursor: (true || false), // 기본값: true
    timeDivision: (int <= 24), // 기본값: 24
    useRowBorder: (true || false), // 기본값: true
    customKeywords:
        (source, keywords) => { keywords.boo = source.poo; } // 기본값: false

Template Keyword Reservation

    Usage: @ggantt:keyword@

    // boo: poo
    제목: title
    시작 타임스탬프: start
    시작 년: startYear
    시작 월: startMonth
    시작 일: startDay
    시작 시: startHour
    시작 분: startMinute
    시작 초: startSecond
    종료 타임스탬프: end
    종료 년: endYear
    종료 월: endMonth
    종료 일: endDay
    종료 시: endHour
    종료 분: endMinute
    종료 초: endSecond

example:

    제목: @ggantt:title@
    시작 일자:> @ggantt:startDate@

will be replaced to:

    제목: 업무 A
    시작 일자: 2022. 07. 07.
