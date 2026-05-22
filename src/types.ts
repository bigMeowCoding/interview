/** 坐标点 */
export interface Point {
  x: number;
  y: number;
}

/** 城市数据传输结构（Worker 通信用） */
export interface CityData {
  id: number;
  point: Point;
}

/** 个体基因型：城市 id 的排列 */
export type Chromosome = number[];

/** 遗传算法配置 */
export interface GAConfig {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  tournamentSize: number;
  maxGenerations: number;
  animationSpeed: number;
}

/** 每代进化统计 */
export interface GenerationStats {
  generation: number;
  bestDistance: number;
  avgDistance: number;
  worstDistance: number;
  bestChromosome: Chromosome;
}

/** Worker 通信消息 */
export type WorkerMessage =
  | { type: 'INIT'; payload: { cities: CityData[]; config: GAConfig } }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'RESET'; payload: { cities: CityData[] } }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GAConfig> }
  | { type: 'TICK'; payload: GenerationStats }
  | { type: 'BEST'; payload: GenerationStats };
