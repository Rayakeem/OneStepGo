import { Request, Response, NextFunction } from 'express';
import { AppError } from '@onestepgo/core-domain';
import logger from './logger';

/**
 * 에러 핸들링 미들웨어
 * 모든 에러를 표준화된 형태로 응답합니다.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // 구조화된 에러 로깅
  logger.error('Request failed', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      ip: req.ip,
    },
  });

  // AppError인 경우 상세한 에러 정보 제공
  if (err instanceof AppError) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        solution: err.solution,
      },
    });
  }

  // 일반 에러
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
      solution: '잠시 후 다시 시도해주세요.',
    },
  });
}

/**
 * 요청 로깅 미들웨어
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
}

