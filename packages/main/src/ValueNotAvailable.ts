import { TypeCheck } from "@pallad/type-check";

const CHECK = new TypeCheck<ValueNotAvailable>("@pallad/config/ValueNotAvailable");

export class ValueNotAvailable extends CHECK.clazz {
    constructor(readonly description: string) {
        super();
        Object.freeze(this);
    }
}
