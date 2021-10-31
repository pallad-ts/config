import {Provider} from "./Provider";

export type Config = Record<string, any>;

export namespace Config {
    export type Resolved<T> = {
        [P in keyof T]: ResolvedValue<T[P]>
    }

    export type ResolvedValue<TType> = TType extends Provider<infer U> ? U : (
        TType extends object ? Resolved<TType> : TType
        );
}
