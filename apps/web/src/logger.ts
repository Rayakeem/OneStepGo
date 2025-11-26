import winston from 'winston';

/**
 * 구조화된 로깅 설정
 * 
 * 로그 레벨: error, warn, info, debug
 * 로그 포맷: JSON (ELK 스택 연동 용이)
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'onestepgo-api' },
  transports: [
    // 에러 로그는 별도 파일로
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
    }),
    // 모든 로그
    new winston.transports.File({ 
      filename: 'logs/combined.log',
    }),
  ],
});

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;

