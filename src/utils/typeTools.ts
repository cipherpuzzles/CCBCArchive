export type Optionable<T> = T | undefined;

export type NotNull<T> = T extends null | undefined ? never : T;