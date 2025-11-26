import * as XLSX from 'xlsx';
import { DataAdapter } from './base';
import { PickupItem, AppError, ErrorCode } from '@onestepgo/core-domain';
import { v4 as uuidv4 } from 'uuid';

/**
 * 엑셀 파일을 파싱하여 PickupItem 배열로 변환하는 어댑터
 * 
 * 구청에서 제공하는 엑셀 파일 형식:
 * - 필수 컬럼: '배출위치' (주소 정보)
 * - 선택 컬럼: 폐기물 종류, 무게 등
 */
export class ExcelAdapter implements DataAdapter {
  // '배출위치' 또는 '배출 위치' (공백 포함) 둘 다 지원
  private readonly POSSIBLE_COLUMNS = ['배출 위치', '배출위치'];

  validate(input: unknown): boolean {
    return Buffer.isBuffer(input);
  }

  async parse(input: unknown): Promise<PickupItem[]> {
    if (!this.validate(input)) {
      throw new AppError(
        ErrorCode.INVALID_FILE_FORMAT,
        '엑셀 파일 형식이 올바르지 않습니다.',
        '올바른 엑셀(.xlsx, .xls) 파일을 업로드해주세요.'
      );
    }

    const buffer = input as Buffer;
    
    try {
      // 엑셀 파일 읽기
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // JSON 형태로 변환
      const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

      if (data.length === 0) {
        throw new AppError(
          ErrorCode.EMPTY_ADDRESS_LIST,
          '엑셀 파일에 데이터가 없습니다.',
          '최소 1개 이상의 주소 데이터를 포함해주세요.'
        );
      }

      // 필수 컬럼 찾기 ('배출 위치' 또는 '배출위치')
      const firstRow = data[0];
      const addressColumn = this.POSSIBLE_COLUMNS.find(col => col in firstRow);

      if (!addressColumn) {
        throw new AppError(
          ErrorCode.MISSING_REQUIRED_COLUMN,
          `필수 컬럼 '배출 위치' 또는 '배출위치'가 없습니다.`,
          `엑셀 파일에 '배출 위치' 컬럼을 추가해주세요. (현재 컬럼: ${Object.keys(firstRow).join(', ')})`
        );
      }

      // PickupItem 배열로 변환
      const pickupItems: PickupItem[] = [];

      for (const row of data) {
        const address = row[addressColumn];
        
        if (typeof address !== 'string' || address.trim() === '') {
          continue; // 빈 주소는 건너뛰기
        }

        const metadata: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          if (key !== addressColumn) {
            metadata[key] = value;
          }
        }

        pickupItems.push({
          id: uuidv4(),
          address: {
            raw: address.trim(),
          },
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });
      }

      if (pickupItems.length === 0) {
        throw new AppError(
          ErrorCode.EMPTY_ADDRESS_LIST,
          '유효한 주소 데이터가 없습니다.',
          `'${addressColumn}' 컬럼에 최소 1개 이상의 주소를 입력해주세요.`
        );
      }

      return pickupItems;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorCode.INVALID_FILE_FORMAT,
        '엑셀 파일을 읽는 중 오류가 발생했습니다.',
        '파일이 손상되지 않았는지 확인해주세요.',
        error as Error
      );
    }
  }
}

