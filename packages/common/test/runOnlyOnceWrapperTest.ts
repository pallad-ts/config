import { runOnlyOnceWrapper } from "@src/runOnlyOnceWrapper";
import * as sinon from "sinon";

describe("runOnlyOnceWrapper", () => {
    it("wraps function and calls it only once", () => {
        const stub = sinon.stub().returns(42);
        const wrapped = runOnlyOnceWrapper(stub);
        expect(wrapped()).toBe(42);
        expect(wrapped()).toBe(42);
        sinon.assert.calledOnce(stub);
    });
});
