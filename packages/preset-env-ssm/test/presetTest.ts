import {createPreset, PresetHelper} from "@src/preset";
import {DefaultValueDependency, ENVDependency, FirstAvailableDependency, TransformableDependency} from "@pallad/config";
import * as sinon from 'sinon';
import {EnvFileDependency, EnvFileHelper, EnvFileLoader} from "@pallad/config-envfile";
import {SSMDependency, SSMHelper, DataLoader} from "@pallad/config-ssm";

describe('preset', () => {
    const ENV_OPTIONS = {
        FOO: 'bar'
    };

    const ENV_FILE_OPTIONS: EnvFileHelper.Options = {
        paths: [
            './envFiles/test.env'
        ],
        config: {
            ignoreNonExisting: true
        }
    };

    const SSM_OPTIONS: SSMHelper.Options = {
        prefix: '/test/',
    };

    const DEFAULT_VALUE = 'some-default-value';

    const KEY = {env: 'FOO', ssmKey: 'foo'};

    function envDependency(key: string, transformer?: TransformableDependency.Transformer<any>) {
        return new ENVDependency(key, transformer, ENV_OPTIONS);
    }

    function envFileDependency(key: string, transformer?: TransformableDependency.Transformer<any>) {
        return new EnvFileDependency(key, transformer, expect.any(EnvFileLoader));
    }

    function ssmDependency(key: string, transformer?: TransformableDependency.Transformer<any>) {
        return new SSMDependency(key, transformer, expect.any(DataLoader));
    }

    describe('env without envFile due to lack of envFile config', () => {
        let preset: PresetHelper;
        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS
            });
        });

        it('without transformer', () => {
            const config = preset(KEY);

            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO')
                    )
                );
        });

        it('with transformer', () => {
            const transformer = sinon.stub();
            const config = preset(KEY, {transformer});

            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO', transformer)
                    )
                );
        });

        it('with default value', () => {
            const config = preset(KEY, {defaultValue: DEFAULT_VALUE});
            expect(config)
                .toMatchObject(
                    new DefaultValueDependency(
                        new FirstAvailableDependency(
                            envDependency('FOO'),
                        ),
                        DEFAULT_VALUE
                    )
                );
        })
    });

    describe('env with envFile', () => {
        let preset: PresetHelper;

        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS,
                envFile: ENV_FILE_OPTIONS
            });
        });

        it('without transformer', () => {
            const config = preset(KEY);

            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO'),
                        envFileDependency('FOO')
                    )
                );
        });

        it('with transformer', () => {
            const transformer = sinon.stub();
            const config = preset(KEY, {transformer});
            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO', transformer),
                        envFileDependency('FOO', transformer)
                    )
                );
        });

        it('with default value', () => {
            const config = preset(KEY, {defaultValue: DEFAULT_VALUE});
            expect(config)
                .toMatchObject(
                    new DefaultValueDependency(
                        new FirstAvailableDependency(
                            envDependency('FOO'),
                            envFileDependency('FOO')
                        ),
                        DEFAULT_VALUE
                    )
                );
        })
    });

    describe('env with envFile and ssm', () => {
        let preset: PresetHelper;

        beforeEach(() => {
            preset = createPreset({
                env: ENV_OPTIONS,
                envFile: ENV_FILE_OPTIONS,
                ssm: SSM_OPTIONS
            });
        });

        it('without transformer', () => {
            const config = preset(KEY);
            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO'),
                        envFileDependency('FOO'),
                        ssmDependency('/test/foo')
                    )
                );
        });

        it('with transformer', () => {
            const transformer = sinon.stub();
            const config = preset(KEY, {transformer});
            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO', transformer),
                        envFileDependency('FOO', transformer),
                        ssmDependency('/test/foo', transformer)
                    )
                );
        });

        it('no ssm if ssmKey not provided', () => {
            const config = preset({env: 'FOO'});
            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        envDependency('FOO'),
                        envFileDependency('FOO'),
                    )
                );
        });

        it('default value', () => {
            const config = preset(KEY, {defaultValue: DEFAULT_VALUE});
            expect(config)
                .toMatchObject(
                    new DefaultValueDependency(
                        new FirstAvailableDependency(
                            envDependency('FOO', undefined),
                            envFileDependency('FOO', undefined),
                            ssmDependency('/test/foo', undefined)
                        ),
                        DEFAULT_VALUE
                    )
                );
        });

        it('only ssm if env key not provided', () => {
            const config = preset({ssmKey: 'foo'});
            expect(config)
                .toMatchObject(
                    new FirstAvailableDependency(
                        ssmDependency('/test/foo', undefined)
                    )
                );
        })
    })
});

