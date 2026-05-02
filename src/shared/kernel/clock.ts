export interface Clock {
  now(): Date;
}

export const SystemClock: Clock = {
  now: () => new Date(),
};

export function fixedClock(date: Date): Clock {
  return { now: () => date };
}
