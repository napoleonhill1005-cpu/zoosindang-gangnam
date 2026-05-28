# 주신당 강남점 매뉴얼 (zoosindang-gangnam)

## 프로젝트 개요
주신당 강남점의 12지신 칵테일 등 주류 매뉴얼을 담은 모바일 PWA(웹앱).
매장 직원이 휴대폰에서 빠르게 메뉴 정보를 확인하는 용도.
배포처: https://zoosindang-gangnam.vercel.app (GitHub에 push하면 Vercel이 자동 배포)

## 파일 구조
- index.html — 앱 전체. HTML + CSS + JS가 한 파일에 들어있음 (약 3,700줄)
- manifest.json — PWA 설정
- icon-192.png, icon-512.png, apple-touch-icon.png — 앱 아이콘

## 기술 스택
- 순수 바닐라 JavaScript (프레임워크/빌드 도구 없음)
- 단일 HTML 파일 구조 — style과 script가 인라인
- 빌드 과정 없음. index.html을 그대로 열면 실행됨

## 화면 구조
- 홈 화면(#home-screen) → 카테고리 선택
- 카테고리 그리드: 12지신, 클래식 칵테일, 생맥주, 전통주, 위스키, 스페셜
- 각 메뉴는 상세 카드(#detail-N 등)로 펼쳐짐
- 화면 전환은 hideAll() + 개별 show 함수로 처리

## 외부 연동
- 바텐더 코멘트는 Google Sheets에서 CSV로 실시간 로딩(loadBartenderComments())
- gviz 방식 1차 시도 → 실패 시 게시 CSV 방식 2차 시도

## 작업 규칙
- 색상은 :root의 CSS 변수 사용(--bg, --gold, --red 등). 하드코딩 금지
- 모바일 우선. 최대 너비 720px. 한국어 UI
- 새 메뉴 추가 시: 그리드 항목 + 상세 카드 + show 함수, 3곳 모두 수정 필요
- 큰 변경 전에는 무엇을 바꿀지 먼저 설명하고 확인받기
- 수정 후에는 변경 사항을 요약해서 알려주기
