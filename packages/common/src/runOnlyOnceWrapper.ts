export function runOnlyOnceWrapper<T>(fn: () => T): () => T {
    let called = false;
    let result: T;
    return () => {
        if (called) {
            return result;
        }
        called = true;
        return (result = fn());
    };
}
