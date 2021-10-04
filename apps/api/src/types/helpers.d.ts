export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export type ReturnTypeOfPromise<T> = ThenArg<ReturnType<T>>;
