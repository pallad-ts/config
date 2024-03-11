import { ERRORS } from "@src/errors";
import * as validations from "@src/types";
import { split } from "@src/types";
import { assert, IsExact } from "conditional-type-checks";
import { parse } from "iso8601-duration";
import * as sinon from "sinon";

import "@pallad/errors-dev";

describe("types", () => {
    describe("string", () => {
        it("gets trimmed", () => {
            expect(validations.string("test ")).toEqual("test");
        });

        it("converts to string", () => {
            expect(
                validations.string({
                    toString() {
                        return "test";
                    },
                })
            ).toEqual("test");
        });
    });

    describe("int", () => {
        it.each([["10"], [10], [10.5], ["10.5"], ["10px"]])("converts to int: %s", input => {
            expect(validations.int(input)).toEqual(10);
        });

        it("fails if not a number", () => {
            expect(() => {
                validations.int("foo");
            }).toThrowErrorMatchingSnapshot();
        });
    });

    describe("number", () => {
        it.each([
            ["10", 10],
            [10, 10],
            [10.5, 10.5],
            ["10.5", 10.5],
            ["10.5px", 10.5],
        ])("converts to number: %s", (input, expected) => {
            expect(validations.number(input)).toEqual(expected);
        });

        it("fails if not a number", () => {
            expect(() => {
                validations.number("foo");
            }).toThrowErrorMatchingSnapshot();
        });
    });

    describe("bool", () => {
        it.each<[any, boolean]>([
            ["yes", true],
            ["no", false],
            ["on", true],
            ["off", false],
            ["1", true],
            ["0", false],
            [1, true],
            [0, false],
        ])("converts to bool: %s - %s", (value, expected) => {
            expect(validations.bool(value)).toEqual(expected);
        });

        it("throws error if cannot be converted to bool", () => {
            expect(() => {
                validations.bool("some strange value");
            }).toThrowErrorMatchingSnapshot();
        });
    });

    describe("url", () => {
        describe("validation", () => {
            const validator = validations.url;

            it("success", () => {
                expect(validator("http://9marshals.com")).toEqual("http://9marshals.com");
            });

            it("failure", () => {
                expect(() => {
                    validator("test");
                }).toThrowErrorMatchingSnapshot();
            });
        });

        describe("requiring protocol", () => {
            const validator = validations.url.options({ protocols: ["http"] });
            it("success", () => {
                expect(validator("http://9marshals.com")).toEqual("http://9marshals.com");
            });

            it("failure", () => {
                expect(() => {
                    validator("ftp://9marshals.com");
                }).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe("split", function () {
        it("trims values and removed empty ones", () => {
            const result = split("foo,bar  , baz,,");
            expect(result).toEqual(["foo", "bar", "baz"]);
        });

        it("ignored empty string", () => {
            const result = split("");
            expect(result).toEqual([]);
        });

        it("uses provided separator", () => {
            const result = split.by(":")("foo,bar:baz ");

            expect(result).toEqual(["foo,bar", "baz"]);
        });

        describe("types", () => {
            it("returns string", () => {
                const value = split("test,test2");
                type Expected = string[];

                assert<IsExact<typeof value, Expected>>(true);
            });
        });
    });

    describe("duration", () => {
        it("converts to duration", () => {
            const duration = validations.duration("PT1H");
            expect(duration).toMatchSnapshot();
        });

        it("fails for invalid duration", () => {
            expect(() => {
                validations.duration("10 seconds");
            }).toThrowErrorWithCode(ERRORS.CANNOT_CONVERT_TO_DURATION);
        });

        describe("options", () => {
            it.each<[string | undefined, string | undefined]>([
                ["PT50M", undefined],
                ["PT10M", "PT20M"],
                [undefined, "PT20M"],
            ])("invalid %s - %s", (min, max) => {
                const type = validations.duration.options({ min, max });
                expect(() => {
                    type("PT30M");
                }).toThrowErrorWithCode(ERRORS.DURATION_INVALID_VALUE_IN_RANGE);
                expect(() => {
                    type("PT30M");
                }).toThrowErrorMatchingSnapshot();
            });

            it.each<[string | undefined, string | undefined]>([
                ["PT10M", undefined],
                ["PT10M", "PT1H"],
                [undefined, "PT50M"],
            ])("valid %s - %s", (min, max) => {
                const type = validations.duration.options({ min, max });

                expect(type("PT30M")).toEqual(parse("PT30M"));
            });

            describe("passing invalid options fails", () => {
                it("min higher than max", () => {
                    expect(() => {
                        validations.duration.options({ min: "PT10M", max: "PT1M" });
                    }).toThrowErrorMatchingSnapshot();
                });

                it("min and max are not valid durations", () => {
                    expect(() => {
                        validations.duration.options({ min: "invalid" });
                    }).toThrowErrorMatchingSnapshot();
                });
            });
        });
    });
});
