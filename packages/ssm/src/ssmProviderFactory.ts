import {SSMProvider} from "./SSMProvider";
import DataLoader = require("dataloader");
import {wrapWithDefaultAndTransformer} from '@pallad/config';
import {SSMClient, Parameter, GetParametersCommand} from '@aws-sdk/client-ssm';

const splitArray = require('split-array');

export function parameterDeserializer(parameter: Parameter) {
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
    const ssm = options?.ssm ?? new SSMClient({});
    const paramDeserializer = options?.parameterDeserializer ?? parameterDeserializer;

    const batchFn = async (keys: readonly string[]) => {
        const map = new Map<string, SSMProvider.Value | undefined>();
        const batches = splitArray(keys, 10);
        for (const batch of batches) {
            const parameters = await ssm.send(new GetParametersCommand({
                Names: batch,
                WithDecryption: true
            }));

            if (parameters.Parameters) {
                for (const parameter of parameters.Parameters) {
                    map.set(parameter.Name!, paramDeserializer(parameter));
                }
            }
        }
        return keys.map(x => map.get(x));
    };

    const dataLoader = (options?.createDataLoader ?? createDataLoader)(batchFn);

    return wrapWithDefaultAndTransformer.wrap((key: string) => {
        return new SSMProvider((options?.prefix ?? '') + key, dataLoader)
    });
}

export namespace ssmProviderFactory {
    export interface Options {
        ssm?: SSMClient;
        createDataLoader?: (batchFn: BatchFunction) => DataLoader<string, SSMProvider.Value | undefined>;
        parameterDeserializer?: ParameterDeserializer;
        prefix?: string;
    }

    export type BatchFunction = (key: readonly string[]) => Promise<Array<SSMProvider.Value | undefined>>;
    export type ParameterDeserializer = (parameter: Parameter) => Promise<any> | any;
}
