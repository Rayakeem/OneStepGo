import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler, requestLogger } from './middleware';
import logger from './logger';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 정적 파일 제공 (프론트엔드)
app.use(express.static(path.join(__dirname, '../public')));

// API 라우트
app.use('/api', routes);

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  });
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

