import { z } from 'zod';

/**
 * 주소 정보를 나타내는 스키마
 */
export const AddressSchema = z.object({
  raw: z.string().min(1, '주소는 필수입니다'),
  normalized: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

/**
 * 픽업 아이템(수거 장소) 스키마
 */
export const PickupItemSchema = z.object({
  id: z.string(),
  address: AddressSchema,
  metadata: z.record(z.unknown()).optional(), // 추가 정보 (예: 폐기물 종류, 무게 등)
});

export type PickupItem = z.infer<typeof PickupItemSchema>;

/**
 * 경로 노드 - 방문 순서를 포함한 픽업 아이템
 */
export const RouteNodeSchema = z.object({
  pickupItem: PickupItemSchema,
  order: z.number().int().nonnegative(),
  distanceFromPrevious: z.number().nonnegative().optional(), // 이전 노드로부터의 거리(미터)
  estimatedTime: z.number().nonnegative().optional(), // 이전 노드로부터의 예상 시간(초)
});

export type RouteNode = z.infer<typeof RouteNodeSchema>;

/**
 * 최적화된 경로 정보
 */
export const OptimizedRouteSchema = z.object({
  startLocation: AddressSchema,
  nodes: z.array(RouteNodeSchema),
  totalDistance: z.number().nonnegative(), // 총 거리(미터)
  totalTime: z.number().nonnegative(), // 총 예상 시간(초)
  createdAt: z.date(),
});

export type OptimizedRoute = z.infer<typeof OptimizedRouteSchema>;

