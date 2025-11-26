import { RouteOptimizer } from '../route-optimizer';
import { PickupItem } from '@onestepgo/core-domain';

describe('RouteOptimizer', () => {
  let optimizer: RouteOptimizer;

  beforeEach(() => {
    optimizer = new RouteOptimizer();
  });

  describe('optimize', () => {
    it('should optimize route with multiple pickup items', async () => {
      const startAddress = '서울시 중구 세종대로 110';

      const pickupItems: PickupItem[] = [
        {
          id: '1',
          address: { raw: '서울시 강남구 테헤란로 123' },
        },
        {
          id: '2',
          address: { raw: '서울시 서초구 서초대로 456' },
        },
        {
          id: '3',
          address: { raw: '서울시 송파구 올림픽로 300' },
        },
      ];

      const result = await optimizer.optimize(startAddress, pickupItems);

      expect(result.startLocation).toBeDefined();
      expect(result.nodes).toHaveLength(3);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.totalTime).toBeGreaterThan(0);

      // 각 노드는 순서가 있어야 함
      result.nodes.forEach((node, index) => {
        expect(node.order).toBe(index + 1);
        expect(node.distanceFromPrevious).toBeGreaterThanOrEqual(0);
        expect(node.estimatedTime).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle single pickup item', async () => {
      const startAddress = '서울시 중구 세종대로 110';

      const pickupItems: PickupItem[] = [
        {
          id: '1',
          address: { raw: '서울시 강남구 테헤란로 123' },
        },
      ];

      const result = await optimizer.optimize(startAddress, pickupItems);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].order).toBe(1);
    });

    it('should throw error for empty pickup items', async () => {
      const startAddress = '서울시 중구 세종대로 110';

      await expect(optimizer.optimize(startAddress, [])).rejects.toThrow();
    });

    it('should geocode all addresses', async () => {
      const startAddress = '서울시 중구 세종대로 110';

      const pickupItems: PickupItem[] = [
        {
          id: '1',
          address: { raw: '서울시 강남구 테헤란로 123' },
        },
      ];

      const result = await optimizer.optimize(startAddress, pickupItems);

      // Geocoding 결과로 위도/경도가 있어야 함
      expect(result.startLocation.lat).toBeDefined();
      expect(result.startLocation.lng).toBeDefined();
      expect(result.nodes[0].pickupItem.address.lat).toBeDefined();
      expect(result.nodes[0].pickupItem.address.lng).toBeDefined();
    });

    it('should preserve metadata', async () => {
      const startAddress = '서울시 중구 세종대로 110';

      const pickupItems: PickupItem[] = [
        {
          id: '1',
          address: { raw: '서울시 강남구 테헤란로 123' },
          metadata: {
            type: '냉장고',
            weight: '50kg',
          },
        },
      ];

      const result = await optimizer.optimize(startAddress, pickupItems);

      expect(result.nodes[0].pickupItem.metadata).toEqual({
        type: '냉장고',
        weight: '50kg',
      });
    });
  });
});

