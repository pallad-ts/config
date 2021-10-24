import {load} from "@src/load";
import {DummyProvider} from "./dummies/DummyProvider";
import {TransformProvider} from "@src/Providers";

describe('load', () => {
    describe('loading', () => {
        const DEP1 = new DummyProvider({value: 'foo', isAsync: true, isAvailable: true});
        const DEP2 = new DummyProvider({value: 'bar', isAsync: false, isAvailable: true});

        it.each<[string, object, object]>([
            [
                'simple object',
                {foo: 'bar', num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]},
                {foo: 'bar', num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]}
            ],
            [
                'with few dependencies',
                {
                    database: {
                        url: new TransformProvider(
                            DEP1,
                            value => value.toUpperCase()
                        )
                    },
                    schedulers: {
                        hello: DEP2,
                        values: [10],
                        // tslint:disable-next-line:no-null-keyword
                        empty: null
                    },
                    schedulers2: {
                        hello: DEP2
                    }
                },
                {
                    database: {
                        url: 'FOO'
                    },
                    schedulers: {
                        hello: 'bar',
                        values: [10],
                        empty: null
                    },
                    schedulers2: {
                        hello: 'bar'
                    }
                }
            ]
        ])('%s', (_desc, source, expected) => {
            return expect(load(source))
                .resolves
                .toEqual(expected);
        })
    })
});