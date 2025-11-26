import { AppError, ErrorCode } from '../errors';

describe('AppError', () => {
  it('should create an error with all properties', () => {
    const error = new AppError(
      ErrorCode.INVALID_FILE_FORMAT,
      '잘못된 파일 형식입니다.',
      '올바른 파일을 업로드해주세요.'
    );

    expect(error.code).toBe(ErrorCode.INVALID_FILE_FORMAT);
    expect(error.message).toBe('잘못된 파일 형식입니다.');
    expect(error.solution).toBe('올바른 파일을 업로드해주세요.');
    expect(error.name).toBe('AppError');
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError(
      ErrorCode.EMPTY_ADDRESS_LIST,
      '주소 목록이 비어있습니다.',
      '최소 1개 이상의 주소를 입력해주세요.'
    );

    const json = error.toJSON();

    expect(json).toEqual({
      code: ErrorCode.EMPTY_ADDRESS_LIST,
      message: '주소 목록이 비어있습니다.',
      solution: '최소 1개 이상의 주소를 입력해주세요.',
    });
  });

  it('should work without solution', () => {
    const error = new AppError(
      ErrorCode.INTERNAL_ERROR,
      '내부 오류가 발생했습니다.'
    );

    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.message).toBe('내부 오류가 발생했습니다.');
    expect(error.solution).toBeUndefined();
  });
});

