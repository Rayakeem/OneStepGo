/**
 * 에러 코드 정의
 * 모든 에러는 명확한 코드와 해결 방법을 포함합니다.
 */
export enum ErrorCode {
  // 파싱 관련
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  MISSING_REQUIRED_COLUMN = 'MISSING_REQUIRED_COLUMN',
  EMPTY_ADDRESS_LIST = 'EMPTY_ADDRESS_LIST',

  // 주소 관련
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  GEOCODING_FAILED = 'GEOCODING_FAILED',

  // 경로 최적화 관련
  INSUFFICIENT_LOCATIONS = 'INSUFFICIENT_LOCATIONS',
  OPTIMIZATION_FAILED = 'OPTIMIZATION_FAILED',
  DISTANCE_CALCULATION_FAILED = 'DISTANCE_CALCULATION_FAILED',

  // 일반
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * 에러 메시지와 해결 방법을 포함하는 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public solution?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      solution: this.solution,
    };
  }
}

