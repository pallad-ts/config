import {Provider} from '../Provider';
import {DefaultValueProvider} from './DefaultValueProvider';
import {TransformProvider} from './TransformProvider';
import {UnwrapProvider} from '../utils';

export function wrapWithDefaultAndTransformer<TProvider extends Provider<any>>(provider: TProvider): TProvider;
export function wrapWithDefaultAndTransformer<TProvider extends Provider<any>>(provider: TProvider, options: undefined): TProvider;
export function wrapWithDefaultAndTransformer<TDefault, TProvider extends Provider<any>>(
    provider: TProvider,
    options: wrapWithDefaultAndTransformer.Options.Default<TDefault>): DefaultValueProvider<TDefault, UnwrapProvider<TProvider>>;
export function wrapWithDefaultAndTransformer<TTransformed, TProvider extends Provider<any>>(
    provider: TProvider,
    options: wrapWithDefaultAndTransformer.Options.Transformer<TTransformed, UnwrapProvider<TProvider>>
): TransformProvider<TTransformed, UnwrapProvider<TProvider>>;
export function wrapWithDefaultAndTransformer<TTransformed, TDefault, TProvider extends Provider<any>>(
    provider: TProvider,
    options: wrapWithDefaultAndTransformer.Options<TTransformed, TDefault, UnwrapProvider<TProvider>>
): DefaultValueProvider<TDefault, TTransformed>;
export function wrapWithDefaultAndTransformer<TTransformed, TDefault, TProvider extends Provider<any>>(
    provider: TProvider,
    options?: wrapWithDefaultAndTransformer.Options<TTransformed, TDefault, UnwrapProvider<TProvider>>) {

    if (!options) {
        return provider;
    }

    const transformed = TransformProvider.optionalWrap<TTransformed, TProvider>(
        provider,
        'transformer' in options ? options.transformer : undefined
    );

    if ('default' in options) {
        return DefaultValueProvider.optionalWrap<TDefault, TTransformed | UnwrapProvider<TProvider>>(
            transformed, options.default
        )
    }
    return transformed;
}

export namespace wrapWithDefaultAndTransformer {
    export type Options<TTransformed, TDefault, TSource> = Options.Transformer<TTransformed, TSource> |
        Options.Default<TDefault> | (Options.Transformer<TTransformed, TSource> & Options.Default<TDefault>)

    export function wrap<T extends (arg: any) => Provider<any>>(factoryFunc: T) {
        function wrapper(arg: Parameters<T>[0]): ReturnType<T>;
        function wrapper(arg: Parameters<T>[0], options: undefined): ReturnType<T>;
        function wrapper<TDefault>(
            arg: Parameters<T>[0],
            options: wrapWithDefaultAndTransformer.Options.Default<TDefault>
        ): DefaultValueProvider<TDefault, UnwrapProvider<ReturnType<T>>>;
        function wrapper<TTransformed>(
            arg: Parameters<T>[0],
            options: wrapWithDefaultAndTransformer.Options.Transformer<TTransformed, UnwrapProvider<ReturnType<T>>>
        ): TransformProvider<TTransformed, UnwrapProvider<ReturnType<T>>>;
        function wrapper<TTransformed, TDefault>(
            arg: Parameters<T>[0],
            options: wrapWithDefaultAndTransformer.Options<TTransformed, TDefault, UnwrapProvider<ReturnType<T>>>
        ): DefaultValueProvider<TDefault, TTransformed | UnwrapProvider<ReturnType<T>>>;
        function wrapper(arg: Parameters<T>[0],
                         options?: wrapWithDefaultAndTransformer.Options<unknown, unknown, UnwrapProvider<ReturnType<T>>>
        ): any {
            return wrapWithDefaultAndTransformer(
                factoryFunc(arg) as any,
                options as any
            );
        }

        return wrapper;
    }

    export namespace Options {
        export interface Transformer<TTransformed, TSource> {
            transformer: TransformProvider.Transformer<TTransformed, TSource>
        }

        export interface Default<TDefault> {
            default: TDefault
        }
    }
}
