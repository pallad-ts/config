import {PickByTypeDependency} from '@src/Dependencies/PickByTypeDependency';
import {ENVDependency} from '@src/Dependencies';
import {env} from '@src/helpers';
import {DummyDependency} from '../stubs/DummyDependency';
import {assert, IsExact} from 'conditional-type-checks';

describe('PickByTypeDependency', () => {

    const DEP_FOO = new DummyDependency({
        value: 'foo',
        description: '"foo" dependency'
    });
    const DEP_BAR = new DummyDependency({
        value: 'bar',
        description: '"bar" dependency'
    });
    const DEP_UNAVAILABLE = new DummyDependency({
        value: '??',
        isAvailable: false
    });

    const OPTIONS_SIMPLE = {
        foo: 'bar'
    };

    const OPTIONS_WITH_DEPS = {
        foo: 'bar?',
        dep: new DummyDependency({
            value: 'works!'
        })
    };

    describe('isAvailable', () => {
        it('true if type and corresponding options dependencies are available', async () => {
            const dep1 = PickByTypeDependency.create(DEP_FOO)
                .registerOptions('foo', OPTIONS_SIMPLE)
                .registerOptions('bar', DEP_UNAVAILABLE)

            const dep2 = PickByTypeDependency.create(DEP_BAR)
                .registerOptions('foo', OPTIONS_SIMPLE)
                .registerOptions('bar', DEP_UNAVAILABLE)

            await expect(dep1.isAvailable())
                .resolves
                .toBe(true);

            await expect(dep2.isAvailable())
                .resolves
                .toBe(false);
        });
    });

    it('getting value', async () => {
        const dep1 = PickByTypeDependency.create(DEP_FOO)
            .registerOptions('foo', OPTIONS_SIMPLE)
            .registerOptions('bar', OPTIONS_WITH_DEPS)

        const dep2 = PickByTypeDependency.create(DEP_BAR)
            .registerOptions('foo', OPTIONS_SIMPLE)
            .registerOptions('bar', OPTIONS_WITH_DEPS);

        await expect(dep1.getValue())
            .resolves
            .toEqual({
                type: 'foo',
                options: OPTIONS_SIMPLE
            });

        await expect(dep2.getValue())
            .resolves
            .toEqual({
                type: 'bar',
                options: {
                    foo: 'bar?',
                    dep: 'works!'
                }
            });
    });

    it('types', () => {
        const dep = PickByTypeDependency.create(DEP_BAR)
            .registerOptions('foo', OPTIONS_SIMPLE)
            .registerOptions('bar', DEP_UNAVAILABLE)
            .registerOptions('zeta', OPTIONS_WITH_DEPS);

        assert<IsExact<ReturnType<typeof dep.getValue>,
            Promise<PickByTypeDependency.Value<'foo', { foo: string }> |
                PickByTypeDependency.Value<'bar', string> |
                PickByTypeDependency.Value<'zeta', { foo: string, dep: string }>>>>(true);
    });
});
