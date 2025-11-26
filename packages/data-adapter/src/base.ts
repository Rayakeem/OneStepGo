import { PickupItem } from '@onestepgo/core-domain';

/**
 * 데이터 어댑터 인터페이스
 * 다양한 소스(엑셀, 텍스트, API 등)로부터 데이터를 읽어
 * 표준화된 PickupItem 배열로 변환합니다.
 */
export interface DataAdapter {
  /**
   * 입력 데이터를 파싱하여 PickupItem 배열로 변환
   * @param input 입력 데이터 (파일 버퍼, 텍스트 등)
   * @returns 정규화된 PickupItem 배열
   */
  parse(input: unknown): Promise<PickupItem[]>;

  /**
   * 어댑터가 처리할 수 있는 입력 타입인지 검증
   */
  validate(input: unknown): boolean;
}

