
export const randomDelay = (): number => {
  return Math.random() * 2000 + 1000; // Entre 1 et 3 secondes
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
