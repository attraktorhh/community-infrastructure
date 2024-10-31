export interface ExecutionResult<TReason extends string, TResult = undefined> {
    success: boolean;
    result?: TResult;
    reason?: TReason;
}