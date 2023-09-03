import {SSMProvider} from "./SSMProvider";
import DataLoader = require("dataloader");
import {wrapWithDefaultAndTransformer} from '@pallad/config';
import {SSMClient, Parameter, GetParametersCommand} from '@aws-sdk/client-ssm';


export function parameterDeserializer(parameter: Parameter) {
    if (parameter.Type === 'StringList') {
        return parameter.Value!.split(',');
    }
    return parameter.Value;
}

function createDataLoader(batchFN: ssmProviderFactory.BatchFunction) {
    return new DataLoader<string, SSMProvider.Value | undefined>(batchFN, {
        maxBatchSize: 10
    });
}

export function ssmProviderFactory<TTransformed, TDefault>(
    options?: ssmProviderFactory.Options
) {
    const ssm = options?.ssm ?? new SSMClient({});
    const paramDeserializer = options?.parameterDeserializer ?? parameterDeserializer;

    const batchFn = async (keys: readonly string[]) => {
        if (keys.length > 10) {
            throw new Error('Misconfigured dataloader. Missing required `maxBatchSize: 10` option');
        }
        const map = new Map<string, SSMProvider.Value | undefined>();
        const parameters = await ssm.send(new GetParametersCommand({
            Names: keys.slice(),
            WithDecryption: true
        }));

        if (parameters.Parameters) {
            for (const parameter of parameters.Parameters) {
                map.set(parameter.Name!, paramDeserializer(parameter));
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
        createDataLoader?: CreateDataLoader;
        parameterDeserializer?: ParameterDeserializer;
        prefix?: string;
    }

    export type CreateDataLoader = (batchFn: BatchFunction) => DataLoader<string, SSMProvider.Value | undefined>
    export type BatchFunction = (key: readonly string[]) => Promise<Array<SSMProvider.Value | undefined>>;
    export type ParameterDeserializer = (parameter: Parameter) => Promise<any> | any;
}
