import {Provider} from "@src/Provider";
import {extractProvidersFromConfig} from "@src/common/extractProvidersFromConfig";
import {string} from "@src/types";
import {DummyProvider} from "../dummies/DummyProvider";

describe('extractProvidersFromConfig', () => {
    describe('no providers', () => {
        it.each<[string, any]>([
            ['empty object', {}],
            // tslint:disable-next-line:no-null-keyword
            ['null', null],
            ['undefined', undefined],
            ['empty array', []],
            ['string', 'str'],
            ['number', 1],
            ['deep object', {test: {still: {no: {deps: []}}}}],
            ['deep object with array', {noDeps: [{}]}]
        ])('%s', (_name: string, config: any) => {
            expect(extractProvidersFromConfig(config))
                .toEqual([]);
        });
    });

    describe('with providers', () => {
        const dep1 = new DummyProvider({isAvailable: true, isAsync: true, value: 1, description: 'someKey1'});
        const dep2 = new DummyProvider({isAvailable: true, isAsync: true, value: 1, description: 'someKey2'});

        it.each<[any, Array<Provider<any>>]>([
            [
                {
                    simple: dep1,
                    dep: dep2
                },
                [dep1, dep2]
            ],
            [
                {
                    nested: {
                        options: [dep1, 'string']
                    }
                },
                [dep1]
            ],
            [
                {
                    strings: ['str1', 'str2'],
                    numbers: [1, 2, 3],
                    // tslint:disable-next-line:no-null-keyword
                    mixed: [true, false, null, undefined],
                    arrays: [
                        [dep2]
                    ]
                },
                [dep2]
            ]
        ])('Case: %#', (value, deps) => {
            expect(extractProvidersFromConfig(value))
                .toEqual(deps)
        });
    })
});