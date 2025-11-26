import { Address, AppError, ErrorCode } from '@onestepgo/core-domain';

/**
 * 간단한 Geocoding 서비스
 * 
 * 참고: 프로토타입이므로 더미 데이터를 사용합니다.
 * 실제 서비스에서는 Google Geocoding API, Kakao 주소 API 등을 사용해야 합니다.
 */
export class GeocodingService {
  /**
   * 주소를 위도/경도로 변환합니다.
   * 
   * 현재는 서울 시내 랜덤 좌표를 반환합니다.
   * 실제 구현 시에는 외부 Geocoding API를 호출해야 합니다.
   */
  async geocode(address: Address): Promise<Address> {
    if (address.lat && address.lng) {
      return address; // 이미 좌표가 있으면 그대로 반환
    }

    try {
      // 실제로는 여기서 Geocoding API를 호출
      // 현재는 데모용으로 서울 중심부 근처의 랜덤 좌표 생성
      const lat = 37.5 + Math.random() * 0.1; // 37.5 ~ 37.6
      const lng = 127.0 + Math.random() * 0.1; // 127.0 ~ 127.1

      return {
        ...address,
        normalized: address.raw,
        lat,
        lng,
      };
    } catch (error) {
      throw new AppError(
        ErrorCode.GEOCODING_FAILED,
        `주소 '${address.raw}'를 위도/경도로 변환할 수 없습니다.`,
        '올바른 주소 형식인지 확인해주세요.',
        error as Error
      );
    }
  }

  /**
   * 여러 주소를 한 번에 Geocoding합니다.
   */
  async geocodeMultiple(addresses: Address[]): Promise<Address[]> {
    return Promise.all(addresses.map((addr) => this.geocode(addr)));
  }
}

