import { describe, it, expect } from 'vitest';
import { randomEdgePoint, extendToBoundary, segmentCircleHit } from './helpers.js';

describe('Hero Helpers', () => {
  describe('randomEdgePoint', () => {
    it('should return a point with x or y at edge', () => {
      const width = 1000;
      const height = 800;
      const margin = 0;

      for (let i = 0; i < 20; i++) {
        const point = randomEdgePoint(width, height, margin);
        const isOnEdge =
          point.x === -margin ||
          point.x === width + margin ||
          point.y === -margin ||
          point.y === height + margin;
        expect(isOnEdge).toBe(true);
      }
    });

    it('should respect margin parameter', () => {
      const width = 1000;
      const height = 800;
      const margin = 50;

      for (let i = 0; i < 20; i++) {
        const point = randomEdgePoint(width, height, margin);
        const isOnEdge =
          point.x === -margin ||
          point.x === width + margin ||
          point.y === -margin ||
          point.y === height + margin;
        expect(isOnEdge).toBe(true);
      }
    });
  });

  describe('extendToBoundary', () => {
    it('should extend point to boundary correctly', () => {
      const start = { x: 100, y: 100 };
      const dir = { x: 1, y: 0 }; // Moving right
      const width = 1000;
      const height = 800;
      const margin = 0;

      const result = extendToBoundary(start, dir, width, height, margin);
      expect(result.x).toBe(width + margin);
      expect(result.y).toBe(100);
    });

    it('should handle vertical movement', () => {
      const start = { x: 500, y: 100 };
      const dir = { x: 0, y: 1 }; // Moving down
      const width = 1000;
      const height = 800;
      const margin = 0;

      const result = extendToBoundary(start, dir, width, height, margin);
      expect(result.x).toBe(500);
      expect(result.y).toBe(height + margin);
    });
  });

  describe('segmentCircleHit', () => {
    it('should detect intersection when segment passes through circle', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 100, y: 0 };
      const circle = { x: 50, y: 0, r: 10 };

      expect(segmentCircleHit(a, b, circle)).toBe(true);
    });

    it('should not detect intersection when segment is far from circle', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 100, y: 0 };
      const circle = { x: 50, y: 100, r: 10 };

      expect(segmentCircleHit(a, b, circle)).toBe(false);
    });

    it('should handle edge case where segment touches circle', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 100, y: 0 };
      const circle = { x: 50, y: 10, r: 10 };

      expect(segmentCircleHit(a, b, circle)).toBe(true);
    });
  });
});

