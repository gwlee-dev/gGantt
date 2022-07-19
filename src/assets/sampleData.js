const date = new Date();
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(date.setDate(date.getDate() - 1))
    .toISOString()
    .split("T")[0];
const tomorrow = new Date(date.setDate(date.getDate() + 2))
    .toISOString()
    .split("T")[0];

const sampleData = [
    {
        title: "일정그룹 A~B",
        id: "0",
        test: "테스트중",
        status: "실행예정",
        schedule: [
            {
                title: "일정 A",
                id: "0B",
                start: `${today} 03:00:00`,
                end: `${today} 05:00:00`,
                data: {
                    one: "한놈",
                    two: "두식이",
                    three: "석삼",
                },
            },
            {
                title: "일정 B",
                id: "0A",
                start: `${today} 12:00:00`,
                end: `${today} 15:00:00`,
            },
        ],
    },
    {
        title: "일정그룹 C~E",
        id: "1",
        schedule: [
            {
                title: "일정 C",
                id: "1A",
                start: `${today} 00:00:00`,
                end: `${today} 04:00:00`,
            },
            {
                title: "일정 D",
                id: "1Aaa",
                start: `${today} 05:00:00`,
                end: `${today} 10:00:00`,
            },
            {
                title: "일정 E",
                id: "1B",
                start: `${today} 10:00:00`,
                end: `${today} 15:00:00`,
            },
        ],
    },
    {
        title: "일정그룹 F~H",
        id: "2",
        schedule: [
            {
                title: "일정 F",
                id: "2asdfA",
                start: `${today} 04:00`,
                end: `${today} 10:00`,
            },
            {
                title: "일정 G",
                id: "2B",
                start: `${today} 10:30`,
                end: `${today} 19:00`,
            },
            {
                title: "일정 H",
                id: "2asdA",
                start: `${yesterday} 22:00`,
                end: `${today} 02:00`,
            },
        ],
    },
    {
        title: "일정그룹 I~J",
        id: "3",
        schedule: [
            {
                title: "일정 I",
                id: "3A",
                start: `${today} 07:30`,
                end: `${today} 14:00`,
            },
            {
                title: "일정 J",
                id: "3B",
                start: `${today} 15:30`,
                end: `${tomorrow} 20:00`,
            },
        ],
    },
    {
        title: "일정그룹 K",
        id: "4",
        schedule: [
            {
                title: "일정 K",
                id: "4A",
                start: `${today} 23:30`,
                end: `${today} 24:00`,
            },
        ],
    },
];

window.sampleData = sampleData;

const templateSample = `
    <div class="text-start">
        <span class="d-block fs-5"><strong>제목:</strong> @ggantt:title@</span>
        <span class="d-block"><strong>시작 타임스탬프</strong>: @ggantt:start@</span>
        <span class="d-block"><strong>시작 일자</strong>: @ggantt:startDate@</span>
        <span class="d-block"><strong>시작 년</strong>: @ggantt:startYear@</span>
        <span class="d-block"><strong>시작 월</strong>: @ggantt:startMonth@</span>
        <span class="d-block"><strong>시작 일</strong>: @ggantt:startDay@</span>
        <span class="d-block"><strong>시작 시간</strong>: @ggantt:startTime@</span>
        <span class="d-block"><strong>시작 GMT시간</strong>: @ggantt:startGMT@</span>
        <span class="d-block"><strong>시작 시</strong>: @ggantt:startHour@</span>
        <span class="d-block"><strong>시작 분</strong>: @ggantt:startMinute@</span>
        <span class="d-block"><strong>시작 초</strong>: @ggantt:startSecond@</span>
        <span class="d-block"><strong>종료 타임스탬프</strong>: @ggantt:end@</span>
        <span class="d-block"><strong>종료 일자</strong>: @ggantt:endDate@</span>
        <span class="d-block"><strong>종료 년</strong>: @ggantt:endYear@</span>
        <span class="d-block"><strong>종료 월</strong>: @ggantt:endMonth@</span>
        <span class="d-block"><strong>종료 일</strong>: @ggantt:endDay@</span>
        <span class="d-block"><strong>종료 GMT시간</strong>: @ggantt:endGMT@</span>
        <span class="d-block"><strong>종료 시간</strong>: @ggantt:endTime@</span>
        <span class="d-block"><strong>종료 시</strong>: @ggantt:endHour@</span>
        <span class="d-block"><strong>종료 분</strong>: @ggantt:endMinute@</span>
        <span class="d-block"><strong>종료 초</strong>: @ggantt:endSecond@</span>
    </div>
`;

window.templateSample = templateSample;
