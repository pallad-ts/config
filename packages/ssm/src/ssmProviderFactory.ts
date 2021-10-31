import {SSM} from 'aws-sdk';
import {SSMProvider} from "./SSMProvider";
import DataLoader = require("dataloader");
import {wrapWithDefaultAndTransformer} from '@pallad/config';

const splitArray = require('split-array');

export function parameterDeserializer(parameter: SSM.Parameter) {
    if (parameter.Type === 'StringList') {
        return parameter.Value!.split(',');
    }
    return parameter.Value;
}

function createDataLoader(batchFN: ssmProviderFactory.BatchFunction) {
    return new DataLoader<string, SSMProvider.Value | undefined>(batchFN);
}

export function ssmProviderFactory<TTransformed, TDefault>(
    options?: ssmProviderFactory.Options
) {
    const ssm = options?.ssm ?? new SSM();
    const paramDeserializer = options?.parameterDeserializer ?? parameterDeserializer;

    const batchFn = async (keys: readonly string[]) => {
        const map = new Map<string, SSMProvider.Value | undefined>();
        const batches = splitArray(keys, 10);
        for (const batch of batches) {
            const parameters = await ssm.getParameters({
                Names: batch,
                WithDecryption: true
            }).promise();

            if (parameters.Parameters) {
                for (const parameter of parameters.Parameters) {
                    map.set(parameter.Name!, paramDeserializer(parameter));
                }
            }
        }
        return keys.map(x => map.get(x));
    };

    const dataLoader = (options?.createDataLoader ?? createDataLoader)(batchFn);
    return function <TTransformed, TDefault>(
        key: string,
        opts?: wrapWithDefaultAndTransformer.Options<TTransformed, TDefault, SSMProvider.Value>
    ) {
        const finalKey = (options?.prefix ?? '') + key;
        return wrapWithDefaultAndTransformer(
            new SSMProvider(finalKey, dataLoader),
            opts
        );
    };
}

export namespace ssmProviderFactory {
    export interface Options {
        ssm?: SSM;
        createDataLoader?: (batchFn: BatchFunction) => DataLoader<string, SSMProvider.Value | undefined>;
        parameterDeserializer?: ParameterDeserializer;
        prefix?: string;
    }

    export type BatchFunction = (key: readonly string[]) => Promise<Array<SSMProvider.Value | undefined>>;
    export type ParameterDeserializer = (parameter: SSM.Parameter) => Promise<any> | any;
}
