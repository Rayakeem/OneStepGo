import { Router } from 'express';
import multer from 'multer';
import { ExcelAdapter, TextAdapter } from '@onestepgo/data-adapter';
import { RouteOptimizer } from '@onestepgo/route-engine';
import { AppError, ErrorCode } from '@onestepgo/core-domain';
import logger from './logger';

const router = Router();

// 파일 업로드 설정 (메모리에 저장)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

const excelAdapter = new ExcelAdapter();
const textAdapter = new TextAdapter();
const routeOptimizer = new RouteOptimizer();

/**
 * POST /api/optimize
 * 
 * 경로 최적화 API
 * 
 * Request:
 * - startLocation: 현재 위치 (주소 문자열)
 * - file: 엑셀 파일 (multipart/form-data)
 * 또는
 * - startLocation: 현재 위치
 * - addresses: 주소 목록 (줄바꿈으로 구분된 텍스트)
 * 
 * Response:
 * - success: true/false
 * - data: OptimizedRoute
 */
router.post('/optimize', upload.single('file'), async (req, res, next) => {
  try {
    const { startLocation, addresses } = req.body;
    const file = req.file;

    // 입력 검증
    if (!startLocation) {
      throw new AppError(
        ErrorCode.INVALID_ADDRESS,
        '시작 위치를 입력해주세요.',
        'startLocation 필드에 현재 위치 주소를 입력해주세요.'
      );
    }

    if (!file && !addresses) {
      throw new AppError(
        ErrorCode.INVALID_FILE_FORMAT,
        '엑셀 파일 또는 주소 목록을 입력해주세요.',
        'file 또는 addresses 필드 중 하나를 입력해주세요.'
      );
    }

    logger.info('Optimization request', {
      startLocation,
      hasFile: !!file,
      hasAddresses: !!addresses,
    });

    // 데이터 파싱
    let pickupItems;
    if (file) {
      // 엑셀 파일 처리
      pickupItems = await excelAdapter.parse(file.buffer);
      logger.info('Parsed excel file', { itemCount: pickupItems.length });
    } else {
      // 텍스트 주소 목록 처리
      pickupItems = await textAdapter.parse(addresses);
      logger.info('Parsed text addresses', { itemCount: pickupItems.length });
    }

    // 경로 최적화
    const startTime = Date.now();
    const optimizedRoute = await routeOptimizer.optimize(startLocation, pickupItems);
    const duration = Date.now() - startTime;

    logger.info('Route optimization completed', {
      itemCount: pickupItems.length,
      totalDistance: optimizedRoute.totalDistance,
      totalTime: optimizedRoute.totalTime,
      duration,
    });

    res.json({
      success: true,
      data: optimizedRoute,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health
 * 
 * 헬스체크 API
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

