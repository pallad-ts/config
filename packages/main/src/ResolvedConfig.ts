import { Provider } from "./Provider";

export namespace ResolvedConfig {
    export type Resolved<T> =
        T extends Provider<infer U>
            ? U
            : {
                  [P in keyof T]: Value<T[P]>;
              };

    export type Value<TType> = TType extends Provider<infer U> ? U : TType extends object ? Resolved<TType> : TType;
}

export type ResolvedConfig<T> = ResolvedConfig.Resolved<T>;
