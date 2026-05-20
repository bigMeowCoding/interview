/** 城市节点：坐标与点击命中检测 */
export class City {
  id: number;
  x: number;
  y: number;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  /** 到另一城市的欧几里得距离 */
  distanceTo(other: City): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** 判断点击是否命中（半径 8px） */
  containsPoint(px: number, py: number): boolean {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy) <= 8;
  }
}
