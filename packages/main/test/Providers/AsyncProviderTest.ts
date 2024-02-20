import { AsyncProvider } from "@src/Providers/AsyncProvider";
import { Provider } from "@src/Provider";
import * as sinon from "sinon";
import { left, right } from "@sweet-monads/either";

describe("AsyncProvider", () => {
    it("calls async function only once", async () => {
        const resolvedValue = right("foo");
        const stub = sinon.stub().resolves(resolvedValue);

        class Test extends AsyncProvider<string> {
            resolveValueAsync(): Promise<Provider.Value<string>> {
                return stub();
            }
        }

        const provider = new Test();

        await expect(provider.getValue()).resolves.toBe(resolvedValue);
        await expect(provider.getValue()).resolves.toBe(resolvedValue);

        sinon.assert.calledOnce(stub);
    });

    it("calls async function only once and caches failure", async () => {
        const resolvedValue = left("invalid value");
        const stub = sinon.stub().resolves(resolvedValue);

        class Test extends AsyncProvider<string> {
            resolveValueAsync(): Promise<Provider.Value<string>> {
                return stub();
            }
        }

        const provider = new Test();

        await expect(provider.getValue()).resolves.toBe(resolvedValue);
        await expect(provider.getValue()).resolves.toBe(resolvedValue);

        sinon.assert.calledOnce(stub);
    });
});
