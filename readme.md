# gGantt

@gwlee-dev


-----------------

ES Module: `import gGantt from "./ggantt.js";`
Browser: `<script src="/ggantt.js"></script>`

**의존성**
- bootstrap ^5.1.3
  - Tooltip, Collapse에서 사용
  - `useTooltip: false` 옵션을 사용하거나, `displayMode: group`을 사용하지 않는 경우 필요하지 않음.
  - bootstrap은 gGantt 보다 먼저 load 되어야 함.
  - bootstrap 전체를 import하고 싶지 않은 경우, 
  - `ggantt.bundle.js`, `ggantt.bundle.css`: bootstrap Tooltip, bootstrap Collapse, gGantt 번들링

-----------------

## 인스턴스 생성

    `const chart = new gGantt.Chart(rootElement, data, options)`

-   rootElement: 인스턴스가 사용할 DOM 개체
    -   예시: document.querySelector("div#gantt")
-   Data: 입력 데이터

-----------------

### 입력 데이터 형식

    const data= [
    {
        title: "일정그룹 A~B",
        id: "0",
        test: "테스트중",
        schedule: [
            {
                title: "일정 A",
                id: "0A",
                start: "2022-07-19 03:00:00",
                end: "2022-07-19 05:00:00",
            },
            {
                title: "일정 B",
                id: "0B",
                start: "2022-07-19 12:00:00",
                end: "2022-07-19 15:00:00",
            },
        ],
    },

-   end 필드의 값은 start 필드의 값 보다 빠를 수 없습니다.
-   입력 데이터의 모든 id값은 중복될 수 없습니다. (group과 schedule 간의 경우 포함)

-----------------

## 사용 가능한 옵션

| 옵션               | 가능한 값                          | 기본값     | 설명                                            |
| ------------------ | ---------------------------------- | ---------- | ----------------------------------------------- |
| `autoInitialize`   | `true, false`                      | `true`     | 인스턴스 생성 후 자동실행 여부                  |
| `displayMode`      | `queue, group, compare, separated` | `group`    | 화면 출력 모드 변경                             |
| `showRange`        | `true, false`                      | `false`    | bar에 시작 ~ 종류 시간 표시                     |
| `useTimeline`      | `true, false`                      | `true`     | 현재 시간 선 표시 여부                          |
| `useDivider`       | `true`,                            | `true`     | 좌우 구분선 및 비율 조정기능 사용 여부          |
| `useTooltip`       | `true, false`                      | `true`     | 툴팁 사용 여부                                  |
| `tooltipPlacement` | `"top", "bottom"`                  | `bottom`   | 툴팁 배치 위치                                  |
| `tooltipTemplate`  | `String, false`                    | `false`    | 툴팁 템플릿 사용 여부                           |
| `labelTemplate`    | `String, false`                    | `false`    | 라벨 템플릿 사용 여부                           |
| `fieldTitle`       | `String`                           | `데이터명` | 좌측 필드명 지정                                |
| `sortChild`        | `true, false`                      | `true`     | 그룹 내 자식요소 정렬 여부 (시작 시간순)        |
| `useCursor`        | `true, false`                      | `true`     | 마우스 호버 시간 선 사용 여부                   |
| `timeDivision`     | `int (최대 24)`                    | `24`       | 표시할 시간 개수 (예: 6 입력시 => 4, 8, 16, 24) |
| `useRowBorder`     | `true, false`                      | `true`     | 행 테두리 표시 여부                             |
| `customKeywords`   | `function(source, keywords)`       | `false`    | 키워드 사용자 정의 (툴팁/라벨 템플릿에서 사용)  |

-----------------
## 템플릿에서 사용 가능한 키워드

-   `tooltipTemplate`이나 `labelTemplate` 옵션에 전달할 String에 포함된 `@ggantt:키워드@`를 해당 데이터로 치환합니다.

    | 키워드        | 대상 데이터     | 키워드      | 대상 데이터     |
    | ------------- | --------------- | ----------- | --------------- |
    | `title`       | 제목            |
    | `start`       | 시작 타임스탬프 | `end`       | 종료 타임스탬프 |
    | `startYear`   | 시작 년         | `endYear`   | 종료 년         |
    | `startMonth`  | 시작 월         | `endMonth`  | 종료 월         |
    | `startDay`    | 시작 일         | `endDay`    | 종료 일         |
    | `startHour`   | 시작 시         | `endHour`   | 종료 시         |
    | `startMinute` | 시작 분         | `endMinute` | 종료 분         |
    | `startSecond` | 시작 초         | `endSecond` | 종료 초         |

    | 치환 전 (예시)                                          | 치환 후                                            |
    | ------------------------------------------------------- | -------------------------------------------------- |
    | `<div class="title">제목: @ggantt:title@</div>`         | `<div class="title">제목: 업무 A</div>`            |
    | `<div class="start"시작 일자: @ggantt:startDate@</div>` | `<div class="start"시작 일자: 2022. 07. 07.</div>` |

-----------------

## 키워드 사용자 정의
-   템플릿에서 사용할 키워드를 직접 정의할 수 있으며, `customKeywords` 옵션을 통해 정의합니다.
-   `customKeywords`는 `function`을 파라메터로 받습니다.
-   `source`와 `keywords` 오브젝트가 제공됩니다.
-   `source.title`과 같이 원본 데이터에 접근할 수 있습니다.
    -   원본 데이터에 `test`라는 필드를 추가한 경우, `source.test`를 통해 해당 필드에 접근할 수 있습니다.
-   `keywords.키워드 = 데이터`로 새로운 키워드를 추가할 수 있습니다.
    - 템플릿에 포함된 `@ggantt:test@`을 원본 데이터의 test로 치환해야 할 경우, 다음과 같이 정의할 수 있습니다.
        `customKeywords: (source, keywords) => {
            keywords.test = source.test;
        }`
-  이미 정의된 키워드를 다시 정의할 경우, 기존 키워드는 제거 (*덮어쓰기) 됩니다.

-----------------
## CSS 변수
-   CSS 변수는 `:root`에 선언되어 있으며, 전역 변수 (global)로 동작합니다.
-   각 ggantt 개체에 CSS 변수를 선언하여, 각 개체별로 다른 스타일을 적용할 수 있습니다.

| 변수 명                       | 기본값                  | 설명                                                          |
| ----------------------------- | ----------------------- | ------------------------------------------------------------- |
| `--ggantt-row-height`         | `1.75rem;`              | 행 높이                                                       |
| `--ggantt-row-gap`            | `0.5rem;`               | 행 간격                                                       |
| `--ggantt-blink-opacity`      | `75%;`                  | (현재 진행 중 스케줄) 깜빡임 투명도                           |
| `--ggantt-divider-color`      | `hsla(208,7%,46%,.5);`  | 좌우 구분선 색상                                              |
| `--ggantt-bar-color`          | `#fff;`                 | bar 텍스트 색상                                               |
| `--ggantt-bar-font-weight`    | `500;`                  | bar 텍스트 두깨                                               |
| `--ggantt-field-font-weight`  | `700;`                  | 필드명 텍스트 두깨                                            |
| `--ggantt-running-bg`         | `#0d6efd;`              | 진행중 bar 배경 색상                                          |
| `--ggantt-queued-bg`          | `#6c757d;`              | 예약 bar 배경 색상                                            |
| `--ggantt-done-bg`            | `#198754;`              | 완료 bar 배경 색상                                            |
| `--ggantt-timeline-color`     | `#ffc107;`              | 현재 시간 선 색상                                             |
| `--ggantt-line-color`         | `#dcdedf;`              | 행/열 선 색상                                                 |
| `--ggantt-hover-bg`           | `#f6f7f8;`              | 행 마우스 호버 시 배경 색상                                   |
| `--ggantt-bar-border-radius`  | `0.375rem;`             | bar 테두리 둥글기                                             |
| `--ggantt-bar-area-min-width` | `43rem;`                | bar 영역 최소 넓이 (최소 넓이 이하로 줄어들 경우 스크롤 발생) |
| `--ggantt-header-bg`          | `hsla(208,7%,46%,.13);` | 필드명/시간 레이블 영역 배경 색상                             |


