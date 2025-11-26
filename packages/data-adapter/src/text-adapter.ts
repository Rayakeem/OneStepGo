import { DataAdapter } from './base';
import { PickupItem, AppError, ErrorCode } from '@onestepgo/core-domain';
import { v4 as uuidv4 } from 'uuid';

/**
 * 텍스트(문자) 메시지를 파싱하여 PickupItem 배열로 변환하는 어댑터
 * 
 * 입력 형식: 한 줄에 하나의 주소 (줄바꿈으로 구분)
 * 예:
 * 서울시 강남구 테헤란로 123
 * 서울시 서초구 서초대로 456
 */
export class TextAdapter implements DataAdapter {
  validate(input: unknown): boolean {
    return typeof input === 'string';
  }

  async parse(input: unknown): Promise<PickupItem[]> {
    if (!this.validate(input)) {
      throw new AppError(
        ErrorCode.INVALID_FILE_FORMAT,
        '텍스트 형식이 올바르지 않습니다.',
        '문자열 형태로 입력해주세요.'
      );
    }

    const text = input as string;
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new AppError(
        ErrorCode.EMPTY_ADDRESS_LIST,
        '유효한 주소 데이터가 없습니다.',
        '최소 1개 이상의 주소를 입력해주세요.'
      );
    }

    const pickupItems: PickupItem[] = lines.map((line) => ({
      id: uuidv4(),
      address: {
        raw: line,
      },
    }));

    return pickupItems;
  }
}

