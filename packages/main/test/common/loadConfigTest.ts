/* eslint-disable no-null/no-null */
import {loadConfig} from "@src/common/loadConfig";
import {DummyProvider} from "../dummies/DummyProvider";
import {TransformProvider} from "@src/Providers";

describe('loadConfig', () => {
    describe('loading async', () => {
        const DEP1 = DummyProvider.async({value: 'foo', isAvailable: true});
        const DEP2 = DummyProvider.async({value: 'bar', isAvailable: true});

        it.each<[string, object, object]>([
            [
                'simple object',
                {foo: DEP1, num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]},
                {foo: 'foo', num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]}
            ],
            [
                'with few dependencies',
                {
                    database: {
                        url: DEP1,
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
                        url: 'foo'
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
        ])('%s', (desc, source, expected) => {
            return expect(loadConfig(source))
                .resolves
                .toEqual(expected);
        })
    });

    describe('loading sync', () => {
        const DEP1 = DummyProvider.sync({value: 'foo', isAvailable: true});
        const DEP2 = DummyProvider.sync({value: 'bar', isAvailable: true});

        it.each<[string, object, object]>([
            [
                'simple object',
                {foo: DEP1, num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]},
                {foo: 'foo', num: 1, bool: false, bool2: true, values: [1, 2, 3, 4]}
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
        ])('%s', (desc, source, expected) => {
            expect(loadConfig(source))
                .toEqual(expected);
        })
    });

    describe('sync + async', () => {
        const DEP1 = DummyProvider.sync({value: 'foo', isAvailable: true});
        const DEP2 = DummyProvider.async({value: 'bar', isAvailable: true});
        const DEP3 = DummyProvider.async({value: 'baz', isAvailable: true});
        const DEP4 = DummyProvider.sync({value: 'far', isAvailable: true});

        it.each<[string, object, object]>([
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
                        values: [DEP3],
                        // tslint:disable-next-line:no-null-keyword
                        empty: null
                    },
                    schedulers2: {
                        hello: DEP2,
                        world: DEP4
                    }
                },
                {
                    database: {
                        url: 'FOO'
                    },
                    schedulers: {
                        hello: 'bar',
                        values: ['baz'],

                        empty: null
                    },
                    schedulers2: {
                        hello: 'bar',
                        world: 'far'
                    }
                }
            ]
        ])('%s', async (desc, source, expected) => {
            return expect(loadConfig(source))
                .resolves
                .toEqual(expected);
        });
    });
});
