**gGantt**

Usage

    const chartObj = new gGantt.Chart(rootElement, Data, Options)

Method

    chartObj.init() // initialize chart

Options

    autoInitialize: (true || false), // default: true
    displayMode: ("queue" || "group" || "separated"), // default: "group"
    tickPositionBottom: (true || false), // default: false
    showRange: (true || false), // default: false
    useTooltip: (true || false), // default: true
    tooltipPlacement: ("top" || "bottom"), // default: bottom
    useTimeline: (true || false), // default: true
    useDivider: true, // default: true
    tooltipTemplate: ("HTML String" || false), // default: false
    labelTemplate: ("HTML String" || false), // default: false
    fieldTitle: ("HTML String"), // default: "데이터명"
    sortChild: (true || false), // default: true
    useCursor: (true || false), // default: true

Template Keyword Reservation

    Usage: @ggantt:#[i keyword] @

    제목: title
    시작 타임스탬프: start
    시작 일자: startDate
    시작 년: startYear
    시작 월: startMonth
    시작 일: startDay
    시작 시간: startTime
    시작 GMT시간: startGMT
    시작 시: startHour
    시작 분: startMinute
    시작 초: startSecond
    종료 타임스탬프: end
    종료 일자: endDate
    종료 년: endYear
    종료 월: endMonth
    종료 일: endDay
    종료 GMT시간: endGMT
    종료 시간: endTime
    종료 시: endHour
    종료 분: endMinute
    종료 초: endSecond

example:

    제목: @ggantt:title@
    시작 일자:> @ggantt:startDate@

will be replaced to:

    제목: 업무 A
    시작 일자: 2022. 07. 07.
