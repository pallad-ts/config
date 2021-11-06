import {Provider} from './Provider';

export type OptionalPromise<T> = T | Promise<T>;
export type UnwrapProvider<T> = T extends Provider<infer U> ? U : T;
