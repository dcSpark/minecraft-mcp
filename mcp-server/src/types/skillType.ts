// Stats data keys used by skills
export type EvaluatorStatsDataKeys =
  | 'craftItemFailCount'
  | 'killMobFailCount'
  | 'mineBlockFailCount'
  | 'placeItemFailCount'
  | 'smeltItemFailCount'
  | 'waitTime';

export interface ISkillServiceParams {
  cancelExecution?: () => void;
  signal?: AbortSignal;
  resetTimeout: () => void;
  getStatsData: (propName: EvaluatorStatsDataKeys) => any | boolean;
  setStatsData: (propName: EvaluatorStatsDataKeys, value: any) => any | boolean;
}

// Simple parameter type for skills
export interface ISkillParams {
  [key: string]: any;
}
