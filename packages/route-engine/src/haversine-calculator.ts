import { Address, AppError, ErrorCode } from '@onestepgo/core-domain';
import { DistanceCalculator } from './distance-calculator';

/**
 * Haversine 공식을 사용한 거리 계산기
 * 실제 도로 거리가 아닌 직선 거리를 계산합니다.
 * 
 * 참고: 프로토타입이므로 직선 거리를 사용하며,
 * 실제 서비스에서는 Google Maps Distance Matrix API 등을 사용해야 합니다.
 */
export class HaversineCalculator implements DistanceCalculator {
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly AVG_SPEED_KM_H = 40; // 평균 속도 40km/h

  async calculate(from: Address, to: Address): Promise<{ distance: number; time: number }> {
    if (!from.lat || !from.lng || !to.lat || !to.lng) {
      throw new AppError(
        ErrorCode.DISTANCE_CALCULATION_FAILED,
        '위도/경도 정보가 없습니다.',
        '주소를 Geocoding하여 위도/경도를 먼저 확보해야 합니다.'
      );
    }

    const distance = this.haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const time = (distance / 1000 / this.AVG_SPEED_KM_H) * 3600; // 초 단위

    return { distance, time };
  }

  async calculateMatrix(locations: Address[]): Promise<number[][]> {
    const n = locations.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          const { distance } = await this.calculate(locations[i], locations[j]);
          matrix[i][j] = distance;
        }
      }
    }

    return matrix;
  }

  /**
   * Haversine 공식으로 두 지점 간 직선 거리 계산
   * @returns 거리(미터)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c * 1000; // 미터로 변환
  }
}

