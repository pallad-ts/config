import {SSM} from 'aws-sdk';
import {DefaultValueDependency, TransformableDependency, env, FirstAvailableDependency, Dependency} from "@pallad/config";
import {SSMDependency} from "./SSMDependency";
import DataLoader = require("dataloader");

const splitArray = require('split-array');

export function parameterDeserializer(parameter: SSM.Parameter) {
    if (parameter.Type === 'StringList') {
        return parameter.Value!.split(',');
    }
    return parameter.Value;
}

function createDateLoader(batchFN: SSMHelper.BatchFunction) {
    return new DataLoader<string, SSMDependency.Value>(batchFN);
}

export function createSSMHelper(options?: SSMHelper.Options) {
    const ssm = (options && options.ssm) || new SSM();
    const paramDeserializer = (options && options.parameterDeserializer) || parameterDeserializer;

    const batchFn: SSMHelper.BatchFunction = async (keys: readonly string[]) => {
        const map = new Map<string, Exclude<SSMDependency.Value, undefined>>();
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

    const dataLoader = ((options && options.createDataLoader) || createDateLoader)(batchFn);
    return function <T>(key: string, opts?: SSMHelper.HelperOptions<T>) {
        const finalKey = ((options && options.prefix) || '') + key;
        return DefaultValueDependency.create(
            new SSMDependency(finalKey, opts && opts.transformer, dataLoader),
            opts && opts.defaultValue
        );
    };
}

export const ssm = createSSMHelper();

export namespace SSMHelper {
    export interface Options {
        ssm?: SSM;
        createDataLoader?: (batchFn: BatchFunction) => DataLoader<string, SSMDependency.Value>;
        parameterDeserializer?: ParameterDeserializer;
        prefix?: string;
    }

    export type EnvOrOptions = Options & {
        envHelper?: <T>(key: string, opts?: HelperOptions<T>) => Dependency<T>;
    }

    export type BatchFunction = (key: readonly string[]) => Promise<SSMDependency.Value[]>;

    export type ParameterDeserializer = (parameter: SSM.Parameter) => Promise<any> | any;

    export interface HelperOptions<T> {
        transformer?: TransformableDependency.Transformer<T>,
        defaultValue?: T
    }

    export interface ENVOrSSMHelperOptions<T> extends HelperOptions<T> {
        ssmName?: string;
    }
}

export function createEnvOrSSMHelper(options?: SSMHelper.EnvOrOptions) {
    const ssm = createSSMHelper(options);
    const envHelper = (options && options.envHelper) || env;
    return function <T>(key: string, opts?: SSMHelper.ENVOrSSMHelperOptions<T>) {
        const ssmName = (opts && opts.ssmName) || key;

        const transformer = opts && opts.transformer;

        return DefaultValueDependency.create(
            new FirstAvailableDependency(
                envHelper(key, {transformer}),
                ssm(ssmName, {transformer})
            ),
            opts && opts.defaultValue
        );
    }
}