import {getDependencies} from "@src/getDependencies";
import {Dependency} from "@src/Dependency";
import {ENVDependency} from "@src/Dependencies/ENVDependency";
import {string} from "@src/types";

describe('getDependencies', () => {
    describe('no dependencies', () => {
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
            expect(getDependencies(config))
                .toEqual([]);
        });
    });

    describe('with dependencies', () => {
        const dep1 = new ENVDependency('someKey', string, {});
        const dep2 = new ENVDependency('someKey2', string, {});

        it.each<[any, Array<Dependency<any>>]>([
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
            expect(getDependencies(value))
                .toEqual(deps)
        });
    })
});