# 아키텍처 가이드

## 전체 구조

OneStepGo는 **Clean Architecture**를 기반으로 설계되었습니다.

## 레이어 구조

### 1. Domain Layer (Core Domain)

**위치**: `packages/core-domain`

**책임**:
- 비즈니스 도메인 모델 정의
- 도메인 로직 (비즈니스 규칙)
- 타입 정의
- 에러 코드 정의

**주요 파일**:
- `models.ts`: Address, PickupItem, RouteNode, OptimizedRoute
- `errors.ts`: AppError, ErrorCode

**특징**:
- 외부 의존성 없음 (Zod만 사용)
- 프레임워크 독립적
- 순수 TypeScript

### 2. Adapter Layer (Data Adapter)

**위치**: `packages/data-adapter`

**책임**:
- 외부 데이터 소스와의 연동
- 데이터 파싱 및 정규화
- 도메인 모델로 변환

**주요 파일**:
- `base.ts`: DataAdapter 인터페이스
- `excel-adapter.ts`: Excel 파일 → PickupItem[]
- `text-adapter.ts`: Text → PickupItem[]

**확장 방법**:

새로운 어댑터를 추가하려면 `DataAdapter` 인터페이스를 구현:

```typescript
export class MyAdapter implements DataAdapter {
  validate(input: unknown): boolean {
    // 입력 검증
  }

  async parse(input: unknown): Promise<PickupItem[]> {
    // 파싱 로직
  }
}
```

### 3. Application Layer (Route Engine)

**위치**: `packages/route-engine`

**책임**:
- 비즈니스 로직 구현
- 경로 최적화 알고리즘
- Geocoding
- 거리 계산

**주요 파일**:
- `route-optimizer.ts`: TSP 알고리즘
- `distance-calculator.ts`: 거리 계산 인터페이스
- `haversine-calculator.ts`: Haversine 공식 구현
- `geocoding-service.ts`: 주소 → 위도/경도

**알고리즘**:

```
1. Nearest Neighbor
   - 현재 위치에서 가장 가까운 미방문 노드 선택
   - O(n²) 시간 복잡도

2. 2-opt Improvement
   - 두 엣지를 교차하여 더 짧은 경로 탐색
   - 개선이 없을 때까지 반복
```

### 4. Interface Layer (Web API)

**위치**: `apps/web`

**책임**:
- HTTP 엔드포인트 제공
- 요청/응답 처리
- 미들웨어 (인증, 로깅, 에러 핸들링)
- 정적 파일 제공

**주요 파일**:
- `index.ts`: Express 서버 설정
- `routes.ts`: API 라우트
- `middleware.ts`: 에러 핸들러, 로거
- `logger.ts`: Winston 로깅 설정

## 데이터 흐름

```
1. 사용자 → 엑셀 파일 업로드
   ↓
2. Express → Multer (파일 파싱)
   ↓
3. ExcelAdapter → PickupItem[] 변환
   ↓
4. GeocodingService → 주소 → 위도/경도
   ↓
5. RouteOptimizer → TSP 알고리즘
   ↓
6. OptimizedRoute → 사용자
```

## 의존성 방향

```
apps/web
  ↓
packages/route-engine
  ↓
packages/data-adapter
  ↓
packages/core-domain
```

**규칙**:
- 하위 레이어는 상위 레이어를 알지 못함
- 의존성은 항상 아래 방향으로만 흐름
- 각 패키지는 독립적으로 테스트 가능

## 에러 처리

모든 에러는 `AppError`로 표준화:

```typescript
throw new AppError(
  ErrorCode.INVALID_FILE_FORMAT,
  '엑셀 파일 형식이 올바르지 않습니다.',
  '올바른 엑셀(.xlsx, .xls) 파일을 업로드해주세요.'
);
```

**특징**:
- 명확한 에러 코드
- 사용자 친화적인 메시지
- 해결 방법 제시

## 로깅 전략

**구조화된 로깅**:

```typescript
logger.info('Route optimization completed', {
  itemCount: 15,
  totalDistance: 25000,
  totalTime: 2250,
  duration: 1200
});
```

**로그 레벨**:
- `error`: 에러 발생
- `warn`: 경고
- `info`: 일반 정보
- `debug`: 디버그 정보

**로그 저장**:
- `logs/error.log`: 에러 로그만
- `logs/combined.log`: 모든 로그
- Console: 개발 환경

## 성능 최적화

1. **거리 행렬 캐싱**
   - 한 번 계산한 거리는 재사용

2. **비동기 병렬 처리**
   - Geocoding은 Promise.all로 병렬 처리

3. **알고리즘 선택**
   - 소규모(< 10개): Brute Force
   - 중규모(10-100개): Nearest Neighbor + 2-opt
   - 대규모(> 100개): Nearest Neighbor만

## 테스트 전략

각 레이어는 독립적으로 테스트:

- **Unit Test**: 각 함수/메서드
- **Integration Test**: 어댑터 + 엔진
- **E2E Test**: API 엔드포인트

**테스트 커버리지 목표**: 80% 이상

