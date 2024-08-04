import { PutParameterCommand, PutParameterCommandInput, SSMClient } from "@aws-sdk/client-ssm";
import { ssmProviderFactory } from "@src/ssmProviderFactory";
import { left, right } from "@sweet-monads/either";
import { LocalstackContainer, StartedLocalStackContainer } from "@testcontainers/localstack";
// eslint-disable-next-line @typescript-eslint/naming-convention
import DataLoader from "dataloader";
import * as sinon from "sinon";



import { ValueNotAvailable } from "@pallad/config";


describe("ssmProviderFactory", () => {
    let container: StartedLocalStackContainer;
    let ssmClient: SSMClient;

    let helper: ReturnType<typeof ssmProviderFactory>;

    const CONFIG = {
        prefix: "pallad-config-",
    };

    async function createParameter(name: string, input: Pick<PutParameterCommandInput, "Value" | "Type">) {
        const result = await ssmClient.send(
            new PutParameterCommand({
                Name: CONFIG.prefix + name,
                ...input,
            })
        );
        console.log(result);
    }

    beforeAll(async () => {
        container = await new LocalstackContainer("localstack/localstack:3.6.0").start();
        ssmClient = new SSMClient({
            endpoint: container.getConnectionUri(),
            logger: console,
        });

        await Promise.all([
            createParameter("var1", { Value: "bar", Type: "String" }),
            createParameter("var2", { Value: "foo,bar", Type: "StringList" }),
            createParameter("var3", { Value: "world", Type: "String" }),
            createParameter("var4", { Value: "10", Type: "String" }),
            createParameter("var5", { Value: "wjeNdAbmyjtqAU2OcuPR15F4xDzlV1uZHmZNNl1p", Type: "String" }),
            createParameter("var6", { Value: "u6yjSXzp9q5yhaCdEWyj", Type: "String" }),
            createParameter("var7", { Value: "7FZxN9NHXcgleeP0TSva", Type: "String" }),
            createParameter("var8", { Value: "R3aogUWGdvDJy03brMVEZBnqKJYZcp", Type: "String" }),
            createParameter("var9", { Value: "XUlAtGjdCwIiHDnojsFqmOC6HO8SyXX", Type: "String" }),
            createParameter("var10", { Value: "u97tvnLBUOurP3FcpUWRqbO81GqqH", Type: "String" }),
            createParameter("var11", { Value: "HMZNkhmMOxZsylqOaxfNwjeAf9Ju", Type: "String" }),
            createParameter("var12", { Value: "DRJeSQn6CmLVuo5eXHGkVABTsgy", Type: "String" }),
        ]);
    }, 120000);

    beforeEach(() => {
        helper = ssmProviderFactory({
            ...CONFIG,
            ssm: ssmClient,
        });
    });

    afterAll(() => {
        return container.stop();
    });

    describe("loading", () => {
        it("success", () => {
            const provider = helper("var1");

            return expect(provider.getValue()).resolves.toEqual(right("bar"));
        });

        it("failure due to lack of parameter", () => {
            const dependency = helper("var1000");

            return expect(dependency.getValue()).resolves.toStrictEqual(
                left(new ValueNotAvailable("SSM: pallad-config-var1000"))
            );
        });

        it("loading array of strings", () => {
            const dependency = helper("var2");
            return expect(dependency.getValue()).resolves.toEqual(right(["foo", "bar"]));
        });

        it("uses custom dataLoader factory", () => {
            const spy = sinon.spy((batchFn: ssmProviderFactory.BatchFunction) => {
                return new DataLoader(batchFn);
            });

            ssmProviderFactory({
                ...CONFIG,
                createDataLoader: spy,
            });

            sinon.assert.calledOnce(spy);
        });

        it("fails if dataloader has misconfigured maxBatchSize", async () => {
            const provider = ssmProviderFactory({
                ...CONFIG,
                createDataLoader: (batchFn: ssmProviderFactory.BatchFunction) => {
                    return new DataLoader(batchFn);
                },
            });

            const result = await Promise.all(
                ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k8", "k10", "k11", "k12"].map(x => {
                    return provider(x).getValue();
                })
            );

            const finalResult = result.map(x => {
                return x.fold(
                    x => {
                        if (x instanceof Error) {
                            return x.message;
                        }
                    },
                    x => undefined
                );
            });

            expect(finalResult).toMatchSnapshot();
        });

        it("using parameter deserializer", () => {
            const stub = sinon.stub().resolves(1000);

            const helper = ssmProviderFactory({
                ...CONFIG,
                ssm: ssmClient,
                parameterDeserializer: stub,
            });

            const dependency = helper("var1");

            return expect(dependency.getValue()).resolves.toEqual(right(1000));
        });

        it("loading many variables", () => {
            const dependencies = [
                helper("var1"),
                helper("var2"),
                helper("var3"),
                helper("var4"),
                helper("var5"),
                helper("var6"),
                helper("var7"),
                helper("var8"),
                helper("var9"),
                helper("var10"),
                helper("var11"),
                helper("var12"),
            ];

            const resolvedDeps = Promise.all(dependencies.map(x => x.getValue()));
            return expect(resolvedDeps).resolves.toEqual(
                [
                    "bar",
                    ["foo", "bar"],
                    "world",
                    "10",
                    "wjeNdAbmyjtqAU2OcuPR15F4xDzlV1uZHmZNNl1p",
                    "u6yjSXzp9q5yhaCdEWyj",
                    "7FZxN9NHXcgleeP0TSva",
                    "R3aogUWGdvDJy03brMVEZBnqKJYZcp",
                    "XUlAtGjdCwIiHDnojsFqmOC6HO8SyXX",
                    "u97tvnLBUOurP3FcpUWRqbO81GqqH",
                    "HMZNkhmMOxZsylqOaxfNwjeAf9Ju",
                    "DRJeSQn6CmLVuo5eXHGkVABTsgy",
                ].map(right)
            );
        });
    });
});
