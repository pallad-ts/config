import {FormattedStringDependency} from "@src/Dependencies";
import {ENVDependency} from "@src/Dependencies";

describe('FormattedStringDependency', () => {

    const DEPENDENCY_AVAILABLE = new ENVDependency('foo', undefined, {foo: 'bar'});
    const DEPENDENCY_NOT_AVAILABLE = new ENVDependency('bar', undefined, {foo: 'bar'});

    describe('creating', () => {
        it('simple string without dependencies', () => {
            expect(FormattedStringDependency.create`Hello ${'world'}`)
                .toEqual('Hello world');
        });

        it('with dependencies', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE}` as any;
            expect(result)
                .toBeInstanceOf(FormattedStringDependency);
        });
    });

    describe('is available', () => {
        it('true if all dependencies are available', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE} and ${DEPENDENCY_AVAILABLE}` as any;

            return expect(result.isAvailable())
                .resolves
                .toEqual(true);
        });

        it('true if all dependencies are available and simple types are ignored', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${'world'} and ${DEPENDENCY_AVAILABLE}` as any;
            return expect(result.isAvailable())
                .resolves
                .toEqual(true);
        });

        it('false if at least one dependency is not available', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE} and ${DEPENDENCY_NOT_AVAILABLE}` as any;

            return expect(result.isAvailable())
                .resolves
                .toEqual(false);
        });
    });

    describe('getting description', () => {
        it('with dependencies', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE} and ${DEPENDENCY_AVAILABLE}` as any;
            expect(result.getDescription())
                .toMatchSnapshot();
        });

        it('with dependencies and simple values', () => {
            const result: FormattedStringDependency = FormattedStringDependency.create`Hello ${'world'} and ${DEPENDENCY_AVAILABLE}` as any;

            expect(result.getDescription())
                .toMatchSnapshot();
        });
    });

    describe('getting value', () => {
        it.each<[string, FormattedStringDependency, string]>([
            [
                'with dependencies',
                FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE}`,
                'Hello bar'
            ],
            [
                'with dependencies and simple values',
                FormattedStringDependency.create`Hello ${DEPENDENCY_AVAILABLE} and ${'world'}` as any,
                'Hello bar and world'
            ]
        ])('%s', (_desc, dep, expected) => {
            return expect(dep.getValue())
                .resolves
                .toEqual(expected)
        });
    })
});