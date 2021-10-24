import {TransformProvider} from "@src/Providers";
import * as sinon from 'sinon';
import {assert, IsExact} from "conditional-type-checks";
import {OptionalPromise} from "@src/utils";
import {ERRORS} from "@src/errors";
import {DummyProvider} from "../dummies/DummyProvider";

describe('TransformProvider', () => {
    const RAW_VALUE = {raw: 'value'};
    const TRANSFORMED_VALUE = {transformed: 'value'};

    function createTransformer(): TransformProvider.Transformer<typeof TRANSFORMED_VALUE> {
        return sinon.stub().returns(TRANSFORMED_VALUE)
    }

    describe('sync', () => {
        describe('if available', () => {
            const transformer = createTransformer()
            const dep = new TransformProvider(
                new DummyProvider({isAvailable: true, isAsync: false, value: RAW_VALUE}),
                transformer
            );

            const value = dep.getValue();
            it('passes raw value through transformer and returns transformed value', () => {
                expect(value)
                    .toStrictEqual(TRANSFORMED_VALUE);

                sinon.assert.calledOnce(transformer as any);
                sinon.assert.calledWithExactly(transformer as any, sinon.match.same(RAW_VALUE));
            });

            it('check types', () => {
                assert<IsExact<typeof value, OptionalPromise<typeof TRANSFORMED_VALUE>>>(true);
            });
        });

        describe('if not available', () => {
            const transformer = createTransformer()
            const dep = new TransformProvider(
                new DummyProvider({isAvailable: false, isAsync: false, value: RAW_VALUE}),
                transformer
            );

            it('throws an error', () => {
                const error = ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(dep.getDescription());
                expect(() => {
                    dep.getValue();
                }).toThrowError(error.message);
                sinon.assert.notCalled(transformer as any);
            });
        });
    });
});