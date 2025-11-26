import { ExcelAdapter } from '../excel-adapter';
import * as XLSX from 'xlsx';
import { AppError, ErrorCode } from '@onestepgo/core-domain';

describe('ExcelAdapter', () => {
  let adapter: ExcelAdapter;

  beforeEach(() => {
    adapter = new ExcelAdapter();
  });

  describe('validate', () => {
    it('should return true for Buffer input', () => {
      const buffer = Buffer.from('test');
      expect(adapter.validate(buffer)).toBe(true);
    });

    it('should return false for non-Buffer input', () => {
      expect(adapter.validate('test')).toBe(false);
      expect(adapter.validate(123)).toBe(false);
      expect(adapter.validate({})).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse valid excel file', async () => {
      // Create a mock excel file
      const ws = XLSX.utils.aoa_to_sheet([
        ['배출위치', '폐기물종류'],
        ['서울시 강남구 테헤란로 123', '냉장고'],
        ['서울시 서초구 서초대로 456', '세탁기'],
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = await adapter.parse(buffer);

      expect(result).toHaveLength(2);
      expect(result[0].address.raw).toBe('서울시 강남구 테헤란로 123');
      expect(result[0].metadata).toEqual({ '폐기물종류': '냉장고' });
      expect(result[1].address.raw).toBe('서울시 서초구 서초대로 456');
    });

    it('should throw error if required column is missing', async () => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['주소', '종류'], // '배출위치' 컬럼이 없음
        ['서울시 강남구', '냉장고'],
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      await expect(adapter.parse(buffer)).rejects.toThrow(AppError);
      await expect(adapter.parse(buffer)).rejects.toMatchObject({
        code: ErrorCode.MISSING_REQUIRED_COLUMN,
      });
    });

    it('should throw error if file is empty', async () => {
      const ws = XLSX.utils.aoa_to_sheet([]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      await expect(adapter.parse(buffer)).rejects.toThrow(AppError);
      await expect(adapter.parse(buffer)).rejects.toMatchObject({
        code: ErrorCode.EMPTY_ADDRESS_LIST,
      });
    });

    it('should skip empty addresses', async () => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['배출위치'],
        ['서울시 강남구 테헤란로 123'],
        [''], // 빈 주소
        ['서울시 서초구 서초대로 456'],
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = await adapter.parse(buffer);

      expect(result).toHaveLength(2);
    });

    it('should throw error for invalid input', async () => {
      await expect(adapter.parse('not a buffer')).rejects.toThrow(AppError);
      await expect(adapter.parse('not a buffer')).rejects.toMatchObject({
        code: ErrorCode.INVALID_FILE_FORMAT,
      });
    });
  });
});

