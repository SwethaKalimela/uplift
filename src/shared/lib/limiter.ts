export type Limiter = {
  run<T>(task: () => Promise<T>): Promise<T>;
  readonly active: number;
  readonly pending: number;
};

export function createLimiter(maxConcurrent: number): Limiter {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= maxConcurrent) return;
    const start = queue.shift();
    if (start) start();
  };

  return {
    run<T>(task: () => Promise<T>) {
      return new Promise<T>((resolve, reject) => {
        const start = () => {
          active += 1;
          task()
            .then(resolve, reject)
            .finally(() => {
              active -= 1;
              next();
            });
        };
        queue.push(start);
        next();
      });
    },
    get active() {
      return active;
    },
    get pending() {
      return queue.length;
    },
  };
}

export async function mapWithLimit<T, R>(items: readonly T[], maxConcurrent: number, task: (item: T) => Promise<R>) {
  const limiter = createLimiter(maxConcurrent);
  return Promise.all(items.map((item) => limiter.run(() => task(item))));
}
