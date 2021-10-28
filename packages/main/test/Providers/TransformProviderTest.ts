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

    describe('async', () => {
        describe('if available', () => {
            const transformer = createTransformer()
            const dep = new TransformProvider(
                DummyProvider.async({isAvailable: true, value: RAW_VALUE}),
                transformer
            );

            const value = dep.getValue();
            it('passes raw value through transformer and returns transformed value', async () => {
                await expect(value)
                    .resolves
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
                DummyProvider.async({isAvailable: false, value: RAW_VALUE}),
                transformer
            );

            it('throws an error', async () => {
                const error = ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.format(dep.getDescription());
                await expect(dep.getValue())
                    .rejects
                    .toThrowError(error.message);
                sinon.assert.notCalled(transformer as any);
            });
        });
    });

    describe('optionalWrap', () => {
        const dummy = DummyProvider.sync<'foo'>({value: 'foo', isAvailable: true});
        it('wraps provided provider with TransformProvider if transform function gets provided', () => {
            const transformer = createTransformer();
            const provider = TransformProvider.optionalWrap(dummy, transformer);

            expect(provider)
                .toStrictEqual(new TransformProvider(dummy, transformer));
        });

        it('returns provided provider if transformed function is not provided', () => {
            const provider = TransformProvider.optionalWrap(dummy, undefined);

            expect(provider)
                .toStrictEqual(dummy);
        });

        it('types', () => {
            const transformer = (x: 'foo') => 1;
            const result = TransformProvider.optionalWrap(dummy, transformer)
            assert<IsExact<typeof result,
                TransformProvider<number, 'foo'> | typeof dummy>>(true);
        });
    });
});
