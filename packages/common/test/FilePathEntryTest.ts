import { FilePathEntry } from "@src/FilePathEntry";

describe("FilePathEntry", () => {
    it.each<[FilePathEntry]>([
        ["file.txt"],
        [{ path: "file.txt", required: true }],
        [{ path: "file.txt", required: false }],
    ])("normalization: %s", entry => {
        expect(FilePathEntry.normalize(entry)).toMatchSnapshot();
    });
});
