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
    accept: <TResult extends VizDisposableAsyncSetupResult>(token: VizStaleAsyncSetupToken, result: TResult, onCurrent: (result: TResult) => void) => boolean;
}
export declare function createVizStaleAsyncSetupGuard(): VizStaleAsyncSetupGuard;
