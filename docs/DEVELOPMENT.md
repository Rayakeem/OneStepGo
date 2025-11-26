# 개발 가이드

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/kimsohee/OneStepGo.git
cd OneStepGo
```

### 2. 의존성 설치

```bash
npm install
```

이 명령어는 모든 workspace의 의존성을 자동으로 설치합니다.

### 3. 빌드

```bash
# 전체 빌드
npm run build

# 특정 패키지만 빌드
npm run build --workspace=packages/core-domain
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 개발 워크플로우

### 새로운 기능 추가하기

#### 1. 브랜치 생성

```bash
git checkout -b feature/my-new-feature
```

#### 2. 코드 작성

레이어별로 코드를 작성합니다:

```
Domain → Adapter → Application → Interface
```

#### 3. 테스트 작성

```bash
# 새 기능에 대한 테스트 작성
# 예: packages/core-domain/src/my-feature.test.ts
```

#### 4. 테스트 실행

```bash
npm run test
```

#### 5. 린트 검사

```bash
npm run lint
```

#### 6. 타입 체크

```bash
npm run type-check
```

#### 7. 커밋 및 푸시

```bash
git add .
git commit -m "feat: add my new feature"
git push origin feature/my-new-feature
```

#### 8. Pull Request 생성

GitHub에서 PR을 생성하면 자동으로 CI가 실행됩니다.

## 코딩 컨벤션

### TypeScript

- **Strict 모드** 사용
- `any` 타입 지양 (경고 표시)
- 명시적 함수 반환 타입은 선택사항

### 네이밍

- **파일명**: kebab-case (예: `route-optimizer.ts`)
- **클래스/인터페이스**: PascalCase (예: `RouteOptimizer`)
- **함수/변수**: camelCase (예: `calculateDistance`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_DISTANCE`)

### 주석

- JSDoc 스타일 사용
- 복잡한 로직에는 설명 추가
- 공개 API는 반드시 주석 작성

```typescript
/**
 * 경로를 최적화합니다.
 * @param startAddress 시작 위치
 * @param pickupItems 방문할 장소 목록
 * @returns 최적화된 경로
 */
async optimize(startAddress: string, pickupItems: PickupItem[]): Promise<OptimizedRoute>
```

## 패키지 추가하기

### 새 workspace 패키지 추가

1. `packages/` 또는 `apps/` 아래에 폴더 생성
2. `package.json` 작성
3. 루트의 `package.json`에 workspace 등록 (자동 감지)

### 의존성 추가

```bash
# 특정 workspace에 의존성 추가
npm install express --workspace=apps/web

# 루트에 devDependency 추가
npm install -D typescript
```

## 디버깅

### VS Code 디버깅 설정

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Web Server",
      "program": "${workspaceFolder}/apps/web/src/index.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/apps/web/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

### 로그 확인

```bash
# 실시간 로그
tail -f logs/combined.log

# 에러 로그만
tail -f logs/error.log
```

## 성능 프로파일링

### Node.js 프로파일러

```bash
node --prof apps/web/dist/index.js
node --prof-process isolate-*.log > processed.txt
```

### 메모리 사용량 확인

```bash
node --inspect apps/web/dist/index.js
# Chrome DevTools에서 chrome://inspect 접속
```

## 문제 해결

### 의존성 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 문제

```bash
# dist 폴더 삭제 후 재빌드
rm -rf packages/*/dist apps/*/dist
npm run build
```

### 타입 에러

```bash
# 타입 캐시 삭제
rm -rf packages/*/dist apps/*/dist
npm run type-check
```

## 유용한 명령어

```bash
# 특정 workspace의 스크립트 실행
npm run dev --workspace=apps/web

# 모든 workspace에서 스크립트 실행
npm run test --workspaces

# workspace 목록 확인
npm ls --workspaces=true

# 의존성 트리 확인
npm ls
```

## 추가 도구

### 추천 VS Code 확장

- ESLint
- Prettier
- TypeScript Vue Plugin
- Jest Runner
- GitLens

### 추천 설정

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

