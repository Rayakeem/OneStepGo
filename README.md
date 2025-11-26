# 🚛 유턴없이 GO (OneStepGo)

> 대형폐기물 수거업체를 위한 경로 최적화 플랫폼

[![CI/CD](https://github.com/kimsohee/OneStepGo/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/kimsohee/OneStepGo/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [개발 경험](#-개발-경험)
- [테스트](#-테스트)
- [배포](#-배포)

---

## 🎯 프로젝트 소개

### 문제 상황

대형폐기물 수거업체는 매일 구청으로부터 수거 대상 목록을 엑셀 파일로 받습니다. 하지만 이 데이터를 기반으로 최적의 수거 경로를 계획하기 위해서는:

1. 엑셀 파일에서 주소를 일일이 복사
2. 네이버/구글 지도에 하나씩 입력
3. 수기로 경로 순서를 조정

이 작업으로 인해 **근무 시작 1시간 전에 출근**해야 하는 문제가 있었습니다.

### 해결 방법

**유턴없이 GO**는 다음과 같은 방식으로 문제를 해결합니다:

- ✅ 엑셀 파일 업로드 또는 주소 직접 입력
- ✅ TSP(Traveling Salesman Problem) 알고리즘으로 자동 경로 최적화
- ✅ 시작 위치에서 출발하여 모든 지점을 방문 후 다시 돌아오는 최단 경로 계산
- ✅ **1시간 → 3분**으로 작업 시간 단축

---

## ✨ 주요 기능

### 1. 다양한 입력 소스 지원

**플러그인 기반 Data Adapter 구조**로 다양한 형태의 데이터를 처리:

- 📄 **Excel Adapter**: 구청 제공 엑셀 파일 (`.xlsx`, `.xls`)
- 📝 **Text Adapter**: 줄바꿈으로 구분된 주소 목록
- 🔌 **확장 가능**: 새로운 어댑터 추가 가능 (API, CSV 등)

### 2. TSP 알고리즘 기반 경로 최적화

```
알고리즘 구성:
1. Nearest Neighbor - 가장 가까운 이웃 우선 방문
2. 2-opt Improvement - 경로 교차를 통한 개선
```

### 3. 구조화된 에러 처리

모든 에러는 **ErrorCode + 해결 방법**을 포함:

```typescript
{
  code: "MISSING_REQUIRED_COLUMN",
  message: "필수 컬럼 '배출위치'이(가) 없습니다.",
  solution: "엑셀 파일에 '배출위치' 컬럼을 추가해주세요."
}
```

### 4. 실시간 로깅 및 모니터링

**Winston 기반 구조화된 로깅**:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Route optimization completed",
  "itemCount": 15,
  "totalDistance": 25000,
  "duration": 1200
}
```

---

## 🛠 기술 스택

### Backend

- **Node.js 18+** - 런타임
- **TypeScript** - 타입 안정성
- **Express** - 웹 프레임워크
- **Zod** - 스키마 검증

### Architecture

- **Monorepo** - Workspace 기반 구조
- **Clean Architecture** - 레이어 분리 (Domain / Adapter / Application / Interface)
- **Plugin Pattern** - 확장 가능한 어댑터 구조

### DevOps

- **Jest** - 테스트 프레임워크
- **ESLint** - 코드 품질 관리
- **GitHub Actions** - CI/CD 파이프라인
- **Winston** - 로깅

---

## 🏗 아키텍처

### 프로젝트 구조

```
OneStepGo/
├── apps/
│   └── web/                  # Express 웹 애플리케이션
│       ├── src/
│       │   ├── index.ts      # 서버 진입점
│       │   ├── routes.ts     # API 라우트
│       │   ├── middleware.ts # 미들웨어 (에러 핸들링, 로깅)
│       │   └── logger.ts     # 구조화된 로깅
│       └── public/
│           └── index.html    # 프론트엔드 UI
├── packages/
│   ├── core-domain/          # 도메인 모델 및 타입
│   │   └── src/
│   │       ├── models.ts     # Address, PickupItem, Route 등
│   │       └── errors.ts     # 에러 코드 및 AppError
│   ├── data-adapter/         # 데이터 입력 어댑터
│   │   └── src/
│   │       ├── base.ts       # DataAdapter 인터페이스
│   │       ├── excel-adapter.ts
│   │       └── text-adapter.ts
│   └── route-engine/         # 경로 최적화 엔진
│       └── src/
│           ├── route-optimizer.ts    # TSP 알고리즘
│           ├── distance-calculator.ts
│           ├── haversine-calculator.ts
│           └── geocoding-service.ts
└── .github/
    └── workflows/            # CI/CD 파이프라인
```

### 레이어 구조

```
┌─────────────────────────────────┐
│   Interface Layer (Web API)     │  ← Express Routes
├─────────────────────────────────┤
│   Application Layer              │  ← Route Optimizer
├─────────────────────────────────┤
│   Adapter Layer                  │  ← Data Adapters
├─────────────────────────────────┤
│   Domain Layer                   │  ← Models, Errors
└─────────────────────────────────┘
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/kimsohee/OneStepGo.git
cd OneStepGo

# 의존성 설치
npm install

# 빌드
npm run build
```

### 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

서버가 실행되면 `http://localhost:3000`에서 웹 UI를 확인할 수 있습니다.

---

## 📚 API 문서

### POST /api/optimize

경로 최적화를 수행합니다.

**Request (엑셀 파일)**

```http
POST /api/optimize
Content-Type: multipart/form-data

{
  "startLocation": "서울시 중구 세종대로 110",
  "file": <Excel File>
}
```

**Request (텍스트)**

```http
POST /api/optimize
Content-Type: application/json

{
  "startLocation": "서울시 중구 세종대로 110",
  "addresses": "서울시 강남구 테헤란로 123\n서울시 서초구 서초대로 456"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "startLocation": {
      "raw": "서울시 중구 세종대로 110",
      "lat": 37.5663,
      "lng": 126.9779
    },
    "nodes": [
      {
        "pickupItem": {
          "id": "uuid",
          "address": {
            "raw": "서울시 강남구 테헤란로 123",
            "lat": 37.4979,
            "lng": 127.0276
          }
        },
        "order": 1,
        "distanceFromPrevious": 8500,
        "estimatedTime": 765
      }
    ],
    "totalDistance": 25000,
    "totalTime": 2250,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/health

서버 상태를 확인합니다.

**Response**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 💡 개발 경험

이 프로젝트는 **토스플레이스 Node.js SDK Platform 팀**의 개발 문화를 반영하여 설계되었습니다.

### 1. SDK/플랫폼 개발 경험

**플러그인 기반 Data Adapter**를 통해 다양한 데이터 소스를 표준화된 도메인 모델로 변환:

- `ExcelAdapter`, `TextAdapter` 등 입력 소스별 플러그인
- 공통 `Normalizer → Validation → Routing Engine` 파이프라인
- 새로운 데이터 소스 추가 시 어댑터만 구현하면 되는 확장 가능한 구조

### 2. 유지보수 가능한 코드 구조

**Clean Architecture** 기반으로 레이어 분리:

- `Core Domain`: 순수 도메인 로직 (프레임워크 독립적)
- `Adapter`: 외부 시스템 연동
- `Application`: 비즈니스 로직
- `Interface`: API 엔드포인트

**Zod 스키마 검증**으로 런타임 타입 안정성 확보

### 3. 모니터링 및 장애 대응

**Winston 기반 구조화된 로깅**:

- JSON 형식으로 로그 저장 (ELK 스택 연동 용이)
- 에러 발생 시 요청 정보 자동 포함
- 성능 지표 (거리 계산 시간, 최적화 소요 시간) 로깅

### 4. 자동화된 배포 파이프라인

**GitHub Actions CI/CD**:

- PR 생성 시 자동 테스트 / ESLint / 타입체크
- main 브랜치 머지 시 자동 빌드 및 배포
- 빌드 캐싱으로 배포 시간 단축

---

## 🧪 테스트

### 테스트 실행

```bash
# 전체 테스트
npm run test

# 특정 패키지 테스트
npm run test --workspace=packages/core-domain

# 커버리지 확인
npm run test -- --coverage
```

### 테스트 구조

각 패키지는 독립적인 테스트를 포함:

- **core-domain**: 도메인 모델 및 에러 검증
- **data-adapter**: 어댑터 파싱 로직 검증
- **route-engine**: TSP 알고리즘 및 거리 계산 검증

---

## 🚢 배포

### 로컬 배포

```bash
npm run build
npm start
```

### Docker 배포 (예시)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 환경 변수

```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🤝 기여

이 프로젝트는 포트폴리오 목적으로 제작되었습니다.

---

## 📄 라이선스

MIT License

---

## 👤 작성자

**김소희**

- GitHub: [@kimsohee](https://github.com/kimsohee)

---

## 🙏 감사의 말

이 프로젝트는 **토스플레이스 Node.js SDK Platform 팀** 채용 공고를 위한 포트폴리오로 제작되었습니다.

**주요 구현 내용**:

1. ✅ Node.js 기반 플랫폼/SDK 개발 경험 (플러그인 기반 아키텍처)
2. ✅ 데이터 수집·모니터링 경험 (구조화된 로깅)
3. ✅ 유지보수 가능한 코드 설계 (Clean Architecture + TypeScript + Zod)
4. ✅ 반복 업무 자동화 (CI/CD 파이프라인)
5. ✅ Developer Experience 개선 (표준화된 에러 메시지, API 문서)