import { TextAdapter } from '../text-adapter';
import { AppError, ErrorCode } from '@onestepgo/core-domain';

describe('TextAdapter', () => {
  let adapter: TextAdapter;

  beforeEach(() => {
    adapter = new TextAdapter();
  });

  describe('validate', () => {
    it('should return true for string input', () => {
      expect(adapter.validate('test')).toBe(true);
    });

    it('should return false for non-string input', () => {
      expect(adapter.validate(123)).toBe(false);
      expect(adapter.validate({})).toBe(false);
      expect(adapter.validate(Buffer.from('test'))).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse valid text input', async () => {
      const text = `서울시 강남구 테헤란로 123
서울시 서초구 서초대로 456
서울시 송파구 잠실동 789`;

      const result = await adapter.parse(text);

      expect(result).toHaveLength(3);
      expect(result[0].address.raw).toBe('서울시 강남구 테헤란로 123');
      expect(result[1].address.raw).toBe('서울시 서초구 서초대로 456');
      expect(result[2].address.raw).toBe('서울시 송파구 잠실동 789');
    });

    it('should skip empty lines', async () => {
      const text = `서울시 강남구 테헤란로 123

서울시 서초구 서초대로 456

`;

      const result = await adapter.parse(text);

      expect(result).toHaveLength(2);
    });

    it('should throw error for empty input', async () => {
      await expect(adapter.parse('')).rejects.toThrow(AppError);
      await expect(adapter.parse('')).rejects.toMatchObject({
        code: ErrorCode.EMPTY_ADDRESS_LIST,
      });
    });

    it('should throw error for invalid input type', async () => {
      await expect(adapter.parse(123)).rejects.toThrow(AppError);
      await expect(adapter.parse(123)).rejects.toMatchObject({
        code: ErrorCode.INVALID_FILE_FORMAT,
      });
    });

    it('should trim whitespace', async () => {
      const text = `  서울시 강남구 테헤란로 123  
  서울시 서초구 서초대로 456  `;

      const result = await adapter.parse(text);

      expect(result[0].address.raw).toBe('서울시 강남구 테헤란로 123');
      expect(result[1].address.raw).toBe('서울시 서초구 서초대로 456');
    });
  });
});

