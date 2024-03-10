import { isEither } from "@sweet-monads/either";
import chalk from "chalk";
import { Config, format as prettyFormat, Plugin, Printer, Refs } from "pretty-format";

import { ERRORS, Provider, ValueNotAvailable } from "@pallad/config";
import { Secret } from "@pallad/secret";

export function renderConfig(config: unknown, options: displayConfig.Options) {
    function renderSecret(secret: Secret<any>, printer: (value: any) => string) {
        if (options.revealSecrets) {
            return printer(secret.getValue());
        }
        return secret.getDescription();
    }

    const secretPlugin: Plugin = {
        test(value: any) {
            return Secret.is(value);
        },
        serialize(val: Secret<any>, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) {
            return (
                renderSecret(val, value => printer(value, config, indentation, depth, refs, true)) +
                " " +
                chalk.yellow("(secret)")
            );
        },
    };

    const providerPlugin: Plugin = {
        test(value: any) {
            return value && isEither(value);
        },
        serialize(
            val: Provider.Value<any>,
            config: Config,
            indentation: string,
            depth: number,
            refs: Refs,
            printer: Printer
        ) {
            if (val.isRight()) {
                return printer(val.value, config, indentation, depth, refs, false);
            }
            const fail = val.value;
            const errors = (Array.isArray(fail) ? fail : [fail])
                .map(x => {
                    if (ValueNotAvailable.isType(x)) {
                        return ERRORS.PROVIDER_VALUE_NOT_AVAILABLE.create(x.description);
                    }
                    return x;
                })
                .map(x => x.message);
            return chalk.red(errors.join(", "));
        },
    };

    return prettyFormat(config, {
        plugins: [secretPlugin, providerPlugin],
    });
}

export namespace displayConfig {
    export interface Options {
        revealSecrets: boolean;
    }
}
