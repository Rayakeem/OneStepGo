import { Address } from '@onestepgo/core-domain';

/**
 * 두 지점 간의 거리를 계산하는 인터페이스
 */
export interface DistanceCalculator {
  /**
   * 두 주소 간의 거리를 계산합니다.
   * @param from 출발지
   * @param to 도착지
   * @returns 거리(미터) 및 예상 시간(초)
   */
  calculate(from: Address, to: Address): Promise<{
    distance: number;
    time: number;
  }>;

  /**
   * 여러 지점 간의 거리 행렬을 계산합니다.
   * @param locations 위치 배열
   * @returns 거리 행렬 (i에서 j로 가는 거리)
   */
  calculateMatrix(locations: Address[]): Promise<number[][]>;
}

