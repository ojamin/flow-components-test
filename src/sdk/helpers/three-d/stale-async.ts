export interface VizDisposableAsyncSetupResult {
  dispose: () => void;
}

export interface VizStaleAsyncSetupToken {
  readonly id: number;
}

export interface VizStaleAsyncSetupGuard {
  begin: () => VizStaleAsyncSetupToken;
  invalidate: (token?: VizStaleAsyncSetupToken) => void;
  isCurrent: (token: VizStaleAsyncSetupToken) => boolean;
  accept: <TResult extends VizDisposableAsyncSetupResult>(
    token: VizStaleAsyncSetupToken,
    result: TResult,
    onCurrent: (result: TResult) => void,
  ) => boolean;
}

export function createVizStaleAsyncSetupGuard(): VizStaleAsyncSetupGuard {
  let currentId = 0;

  return {
    begin() {
      currentId += 1;
      return { id: currentId };
    },
    invalidate(token) {
      if (!token || token.id === currentId) currentId += 1;
    },
    isCurrent(token) {
      return token.id === currentId;
    },
    accept(token, result, onCurrent) {
      if (token.id !== currentId) {
        result.dispose();
        return false;
      }
      onCurrent(result);
      return true;
    },
  };
}
