// The screen cache follows the navigation history: going back drops the screens
// that were ahead of the current one, so going forward to them fetches again.
const stack: string[] = [];
const listeners = new Set<(scope: string) => void>();

export const trackPath = (path: string) => {
  const index = stack.indexOf(path);
  if (index === -1) {
    stack.push(path);
    return;
  }
  const dropped = stack.splice(index + 1);
  dropped.forEach((scope) => listeners.forEach((listener) => listener(scope)));
};

export const onScopeDropped = (listener: (scope: string) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetNavigationCache = () => {
  stack.length = 0;
};
