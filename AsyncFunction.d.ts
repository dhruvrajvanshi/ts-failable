import { FailablePromise } from "./ts-failable";
/**
 * Helper type for an async function that
 * takes Req and returns a {@link FailablePromise}<Res, Err>.
 */
export declare type AsyncFunction<Req, Res, Err> = (req: Req) => FailablePromise<Res, Err>;
