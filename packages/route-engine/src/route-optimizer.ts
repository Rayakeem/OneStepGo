import { PickupItem, OptimizedRoute, RouteNode, AppError, ErrorCode } from '@onestepgo/core-domain';
import { DistanceCalculator } from './distance-calculator';
import { HaversineCalculator } from './haversine-calculator';
import { GeocodingService } from './geocoding-service';

/**
 * TSP (Traveling Salesman Problem) 알고리즘을 사용한 경로 최적화 엔진
 * 
 * 알고리즘:
 * 1. Nearest Neighbor - 가장 가까운 이웃을 반복적으로 방문
 * 2. 2-opt 개선 - 경로를 교차하여 더 짧은 경로 탐색
 */
export class RouteOptimizer {
  private distanceCalculator: DistanceCalculator;
  private geocodingService: GeocodingService;

  constructor(
    distanceCalculator?: DistanceCalculator,
    geocodingService?: GeocodingService
  ) {
    this.distanceCalculator = distanceCalculator || new HaversineCalculator();
    this.geocodingService = geocodingService || new GeocodingService();
  }

  /**
   * 경로를 최적화합니다.
   * @param startAddress 시작 위치 (현재 위치)
   * @param pickupItems 방문할 장소 목록
   * @returns 최적화된 경로
   */
  async optimize(startAddress: string, pickupItems: PickupItem[]): Promise<OptimizedRoute> {
    if (pickupItems.length === 0) {
      throw new AppError(
        ErrorCode.INSUFFICIENT_LOCATIONS,
        '방문할 장소가 없습니다.',
        '최소 1개 이상의 장소를 입력해주세요.'
      );
    }

    // 1. 시작 위치 Geocoding
    const start = await this.geocodingService.geocode({ raw: startAddress });

    // 2. 모든 픽업 아이템 Geocoding
    const geocodedItems = await Promise.all(
      pickupItems.map(async (item) => ({
        ...item,
        address: await this.geocodingService.geocode(item.address),
      }))
    );

    // 3. 거리 행렬 계산
    const allLocations = [start, ...geocodedItems.map((item) => item.address)];
    const distanceMatrix = await this.distanceCalculator.calculateMatrix(allLocations);

    // 4. TSP 알고리즘으로 최적 경로 찾기
    const optimalOrder = this.solveTSP(distanceMatrix);

    // 5. RouteNode 배열 생성
    const nodes: RouteNode[] = [];
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < optimalOrder.length; i++) {
      const currentIndex = optimalOrder[i];
      const pickupItem = geocodedItems[currentIndex - 1]; // -1은 시작점 제외

      let distanceFromPrevious: number;
      let timeFromPrevious: number;

      if (i === 0) {
        // 첫 번째 노드: 시작점에서의 거리
        const result = await this.distanceCalculator.calculate(start, pickupItem.address);
        distanceFromPrevious = result.distance;
        timeFromPrevious = result.time;
      } else {
        // 이후 노드: 이전 노드에서의 거리
        const prevIndex = optimalOrder[i - 1];
        const prevItem = geocodedItems[prevIndex - 1];
        const result = await this.distanceCalculator.calculate(prevItem.address, pickupItem.address);
        distanceFromPrevious = result.distance;
        timeFromPrevious = result.time;
      }

      totalDistance += distanceFromPrevious;
      totalTime += timeFromPrevious;

      nodes.push({
        pickupItem,
        order: i + 1,
        distanceFromPrevious,
        estimatedTime: timeFromPrevious,
      });
    }

    // 마지막: 마지막 노드에서 시작점으로 돌아오는 거리
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const result = await this.distanceCalculator.calculate(lastNode.pickupItem.address, start);
      totalDistance += result.distance;
      totalTime += result.time;
    }

    return {
      startLocation: start,
      nodes,
      totalDistance,
      totalTime,
      createdAt: new Date(),
    };
  }

  /**
   * TSP를 해결하는 메인 알고리즘
   * Nearest Neighbor + 2-opt 개선 사용
   * 
   * @param distanceMatrix 거리 행렬 (0은 시작점)
   * @returns 최적 방문 순서 (시작점 제외, 1부터 시작)
   */
  private solveTSP(distanceMatrix: number[][]): number[] {
    const n = distanceMatrix.length;
    
    if (n <= 1) {
      return [];
    }

    // Nearest Neighbor로 초기 해 구하기
    let route = this.nearestNeighbor(distanceMatrix);

    // 2-opt로 개선
    route = this.twoOptImprove(distanceMatrix, route);

    return route;
  }

  /**
   * Nearest Neighbor 알고리즘
   * 현재 위치에서 가장 가까운 미방문 노드를 반복적으로 선택
   */
  private nearestNeighbor(distanceMatrix: number[][]): number[] {
    const n = distanceMatrix.length;
    const visited = new Set<number>([0]); // 시작점은 방문 완료
    const route: number[] = [];
    let current = 0;

    while (visited.size < n) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let i = 1; i < n; i++) {
        if (!visited.has(i) && distanceMatrix[current][i] < minDistance) {
          minDistance = distanceMatrix[current][i];
          nearest = i;
        }
      }

      if (nearest === -1) break;

      visited.add(nearest);
      route.push(nearest);
      current = nearest;
    }

    return route;
  }

  /**
   * 2-opt 알고리즘으로 경로 개선
   * 두 엣지를 교차하여 더 짧은 경로를 찾음
   */
  private twoOptImprove(distanceMatrix: number[][], route: number[]): number[] {
    const n = route.length;
    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;

      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n; j++) {
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          const currentDistance = this.calculateRouteDistance(distanceMatrix, bestRoute);
          const newDistance = this.calculateRouteDistance(distanceMatrix, newRoute);

          if (newDistance < currentDistance) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return bestRoute;
  }

  /**
   * 2-opt swap 수행
   */
  private twoOptSwap(route: number[], i: number, j: number): number[] {
    const newRoute = [...route.slice(0, i + 1), ...route.slice(i + 1, j + 1).reverse(), ...route.slice(j + 1)];
    return newRoute;
  }

  /**
   * 경로의 총 거리 계산
   */
  private calculateRouteDistance(distanceMatrix: number[][], route: number[]): number {
    let distance = 0;

    // 시작점 -> 첫 번째 노드
    if (route.length > 0) {
      distance += distanceMatrix[0][route[0]];
    }

    // 노드 간 거리
    for (let i = 0; i < route.length - 1; i++) {
      distance += distanceMatrix[route[i]][route[i + 1]];
    }

    // 마지막 노드 -> 시작점
    if (route.length > 0) {
      distance += distanceMatrix[route[route.length - 1]][0];
    }

    return distance;
  }
}

