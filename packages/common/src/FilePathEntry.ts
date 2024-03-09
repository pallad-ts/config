export type FilePathEntry = string | FilePathEntry.Shape;
export namespace FilePathEntry {
    export interface Shape {
        path: string;
        required: boolean;
    }

    export function normalize(entry: FilePathEntry): FilePathEntry.Shape {
        if (typeof entry === "string") {
            return {
                path: entry,
                required: true,
            };
        }

        return entry;
    }
}
