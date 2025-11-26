import { HaversineCalculator } from '../haversine-calculator';
import { Address } from '@onestepgo/core-domain';

describe('HaversineCalculator', () => {
  let calculator: HaversineCalculator;

  beforeEach(() => {
    calculator = new HaversineCalculator();
  });

  describe('calculate', () => {
    it('should calculate distance between two points', async () => {
      const from: Address = {
        raw: '서울시청',
        lat: 37.5663,
        lng: 126.9779,
      };

      const to: Address = {
        raw: '강남역',
        lat: 37.4979,
        lng: 127.0276,
      };

      const result = await calculator.calculate(from, to);

      expect(result.distance).toBeGreaterThan(0);
      expect(result.time).toBeGreaterThan(0);
      // 서울시청-강남역 직선거리는 약 8km
      expect(result.distance).toBeGreaterThan(7000);
      expect(result.distance).toBeLessThan(9000);
    });

    it('should return 0 for same location', async () => {
      const location: Address = {
        raw: '서울시청',
        lat: 37.5663,
        lng: 126.9779,
      };

      // Haversine 공식 특성상 완전히 같은 좌표는 0이 나옴
      const result = await calculator.calculate(location, location);

      expect(result.distance).toBe(0);
      expect(result.time).toBe(0);
    });

    it('should throw error if coordinates are missing', async () => {
      const from: Address = {
        raw: '서울시청',
      };

      const to: Address = {
        raw: '강남역',
        lat: 37.4979,
        lng: 127.0276,
      };

      await expect(calculator.calculate(from, to)).rejects.toThrow();
    });
  });

  describe('calculateMatrix', () => {
    it('should calculate distance matrix', async () => {
      const locations: Address[] = [
        { raw: 'A', lat: 37.5, lng: 127.0 },
        { raw: 'B', lat: 37.51, lng: 127.01 },
        { raw: 'C', lat: 37.52, lng: 127.02 },
      ];

      const matrix = await calculator.calculateMatrix(locations);

      expect(matrix).toHaveLength(3);
      expect(matrix[0]).toHaveLength(3);

      // 대각선은 0
      expect(matrix[0][0]).toBe(0);
      expect(matrix[1][1]).toBe(0);
      expect(matrix[2][2]).toBe(0);

      // 거리는 양수
      expect(matrix[0][1]).toBeGreaterThan(0);
      expect(matrix[1][2]).toBeGreaterThan(0);

      // 대칭 (직선 거리이므로 A→B = B→A)
      expect(matrix[0][1]).toBeCloseTo(matrix[1][0]);
    });
  });
});

