import {load} from "@src/load";
import {ENVDependency, FormattedStringDependency} from "@src/Dependencies";

describe('load', () => {

    describe('loading', () => {
        const DEP1 = new ENVDependency('foo', undefined, {foo: 'bar'});
        const DEP2 = new ENVDependency('foo', undefined, {foo: 'world'});

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
                        url: FormattedStringDependency.create`http://${DEP1}`
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
                        url: 'http://bar'
                    },
                    schedulers: {
                        hello: 'world',
                        values: [10],
                        // tslint:disable-next-line:no-null-keyword
                        empty: null
                    },
                    schedulers2: {
                        hello: 'world'
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