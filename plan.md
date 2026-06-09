## 목표
현재 React + TypeScript + shadcn/ui 기반 앱을 **순수 HTML + CSS + 바닐라 JS**로 재작성합니다. 모든 기존 기능(엑셀 업로드, 학점 계산, 전공 추천, 이수체계도 등)을 유지합니다.

## 새 파일 구조
```text
/index.html                 — 학생 정보 입력 폼 (시작 페이지)
/dashboard.html             — 탭형 대시보드 (이수체계도/전공필수/전공추천/학점현황)
/css/styles.css             — 전체 스타일 (세종 레드 디자인 토큰 포함)
/js/supabase.js             — Supabase 클라이언트 (CDN)
/js/data.js                 — 학생정보/성적표 localStorage 헬퍼
/js/transcript.js           — XLSX 파싱 (SheetJS CDN)
/js/curriculum.js           — courses/departments fetch
/js/credits.js              — 학점 계산 로직
/js/index-page.js           — 학생정보 폼 로직
/js/dashboard-page.js       — 탭 전환 + 4개 뷰 렌더링
```

## 유지되는 기능
- 학과/학번/현재학기 입력 → localStorage 저장 → dashboard 이동
- 이수체계도: 학년·학기별 과목 카드, 수강완료 체크 표시, 성적 배지
- 엑셀 성적표 업로드: SheetJS로 파싱, F/FA/NP는 미이수 처리, 재수강 덮어쓰기
- 전공필수 탭: 이수완료 / 재수강 필요 / 이번학기 권장 / 향후 예정 분류
- 전공추천 탭: 미이수 전공 과목 추천
- 학점현황 탭: 전공필수·전공선택·교양필수·교양선택 학점 진행률
- 2026학번 → 2025 커리큘럼 적용

## 외부 의존성 (CDN)
- `@supabase/supabase-js` (커리큘럼 데이터)
- `xlsx` (SheetJS, 엑셀 파싱)

## 디자인
- index.css의 디자인 토큰(세종 레드, primary 등)을 :root CSS 변수로 이식
- Tailwind 유틸리티를 동등한 CSS 클래스로 재구현
- shadcn 컴포넌트 (Card, Tabs, Badge, Progress, Button, Input, Select) → 순수 CSS 클래스로 대체

## 제거되는 것
- React, Vite, TypeScript, Tailwind, shadcn/ui, React Query, 모든 npm 의존성
- `package.json`은 단순 정적 파일 서빙용으로 축소 (또는 그대로 둠)
- `src/` 폴더 전체 제거

## 동작 검증
- 학생정보 폼 → 대시보드 이동
- 엑셀 업로드 후 수강완료 체크 표시 확인
- 학점 계산 정확성 확인
- 탭 전환 동작 확인
