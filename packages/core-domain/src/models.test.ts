import { AddressSchema, PickupItemSchema, RouteNodeSchema, OptimizedRouteSchema } from '../models';

describe('Domain Models', () => {
  describe('AddressSchema', () => {
    it('should validate a valid address', () => {
      const address = {
        raw: '서울시 강남구 테헤란로 123',
        normalized: '서울특별시 강남구 테헤란로 123',
        lat: 37.5665,
        lng: 126.9780,
      };

      const result = AddressSchema.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should accept address without coordinates', () => {
      const address = {
        raw: '서울시 강남구 테헤란로 123',
      };

      const result = AddressSchema.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should reject empty address', () => {
      const address = {
        raw: '',
      };

      const result = AddressSchema.safeParse(address);
      expect(result.success).toBe(false);
    });
  });

  describe('PickupItemSchema', () => {
    it('should validate a valid pickup item', () => {
      const item = {
        id: 'test-id',
        address: {
          raw: '서울시 강남구 테헤란로 123',
        },
        metadata: {
          type: '대형폐기물',
          weight: '50kg',
        },
      };

      const result = PickupItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should work without metadata', () => {
      const item = {
        id: 'test-id',
        address: {
          raw: '서울시 강남구 테헤란로 123',
        },
      };

      const result = PickupItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });
  });

  describe('RouteNodeSchema', () => {
    it('should validate a valid route node', () => {
      const node = {
        pickupItem: {
          id: 'test-id',
          address: {
            raw: '서울시 강남구 테헤란로 123',
          },
        },
        order: 1,
        distanceFromPrevious: 1000,
        estimatedTime: 180,
      };

      const result = RouteNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('should reject negative order', () => {
      const node = {
        pickupItem: {
          id: 'test-id',
          address: {
            raw: '서울시 강남구 테헤란로 123',
          },
        },
        order: -1,
      };

      const result = RouteNodeSchema.safeParse(node);
      expect(result.success).toBe(false);
    });
  });

  describe('OptimizedRouteSchema', () => {
    it('should validate a valid optimized route', () => {
      const route = {
        startLocation: {
          raw: '서울시 강남구 역삼동',
          lat: 37.5,
          lng: 127.0,
        },
        nodes: [
          {
            pickupItem: {
              id: 'test-1',
              address: {
                raw: '서울시 강남구 테헤란로 123',
              },
            },
            order: 1,
            distanceFromPrevious: 1000,
            estimatedTime: 180,
          },
        ],
        totalDistance: 5000,
        totalTime: 900,
        createdAt: new Date(),
      };

      const result = OptimizedRouteSchema.safeParse(route);
      expect(result.success).toBe(true);
    });
  });
});

