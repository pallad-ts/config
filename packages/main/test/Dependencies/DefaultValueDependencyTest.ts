import {DefaultValueDependency, ENVDependency} from "@src/Dependencies";

describe('DefaultValueDependency', () => {
    const DEPENDENCY_AVAILABLE = new ENVDependency('foo', undefined, {foo: 'bar'});
    const DEPENDENCY_NOT_AVAILABLE = new ENVDependency('bar', undefined, {});

    const DEP_FROM_AVAILABLE = new DefaultValueDependency(DEPENDENCY_AVAILABLE, 'world');
    const DEP_FROM_NOT_AVAILABLE = new DefaultValueDependency(DEPENDENCY_NOT_AVAILABLE, 'world');

    it('is available - always true', async () => {
        expect(await DEP_FROM_AVAILABLE.isAvailable())
            .toEqual(true);

        expect(await DEP_FROM_NOT_AVAILABLE.isAvailable())
            .toEqual(true);
    });

    it('getting description', () => {
        expect(DEP_FROM_AVAILABLE.getDescription())
            .toMatchSnapshot();

        expect(DEP_FROM_NOT_AVAILABLE.getDescription())
            .toMatchSnapshot();
    });

    describe('creating', () => {
        it('returns dependency if default value not available', () => {
            expect(DefaultValueDependency.create(DEPENDENCY_AVAILABLE))
                .toEqual(DEPENDENCY_AVAILABLE);
        });

        it('returns wrapped dependency', () => {
            expect(DefaultValueDependency.create(DEPENDENCY_AVAILABLE, 'test'))
                .toEqual(new DefaultValueDependency(DEPENDENCY_AVAILABLE, 'test'));
        });
    });

    describe('getting value', () => {
        const DEFAULT = 'random value';

        it('returns dependency value if available', () => {
            const dep = new DefaultValueDependency(DEPENDENCY_AVAILABLE, DEFAULT);
            return expect(dep.getValue())
                .resolves
                .toEqual('bar');
        });

        it('returns default value is dependency not available', () => {
            const dep = new DefaultValueDependency(DEPENDENCY_NOT_AVAILABLE, DEFAULT);
            return expect(dep.getValue())
                .resolves
                .toEqual(DEFAULT);
        });
    });
});