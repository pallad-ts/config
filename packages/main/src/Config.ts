import {Dependency} from "./Dependency";

export interface Config { [key: string]: any }

export namespace Config {
    export type Resolved<T> = {
        [P in keyof T]: ResolvedValue<T[P]>
    }

    export type ResolvedValue<TType> =
        TType extends Dependency<infer U> ? U : (
            TType extends object ? Resolved<TType> : TType
            );
}