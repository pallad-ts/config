export class ValueNotAvailable {
    constructor(readonly description: string) {
        Object.freeze(this);
    }

    static is(value: any): value is ValueNotAvailable {
        return value instanceof ValueNotAvailable;
    }
}
