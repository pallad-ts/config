import * as validations from '@src/types';

describe('types', () => {
    describe('string', () => {
        it('gets trimmed', () => {
            expect(validations.string('test '))
                .toEqual('test');
        });

        it('converts to string', () => {
            expect(
                validations.string({
                    toString() {
                        return 'test'
                    }
                })
            )
                .toEqual('test');
        });
    });

    describe('int', () => {
        it.each([
            ['10'],
            [10],
            [10.5],
            ['10.5'],
            ['10px']
        ])('converts to int: %s', (input) => {
            expect(validations.int(input))
                .toEqual(10);
        });

        it('fails if not a number', () => {
            expect(() => {
                validations.int('foo')
            })
                .toThrowErrorMatchingSnapshot();
        });
    });

    describe('number', () => {
        it.each([
            ['10', 10],
            [10, 10],
            [10.5, 10.5],
            ['10.5', 10.5],
            ['10.5px', 10.5]
        ])('converts to number: %s', (input, expected) => {
            expect(validations.number(input))
                .toEqual(expected);
        });

        it('fails if not a number', () => {
            expect(() => {
                validations.number('foo')
            })
                .toThrowErrorMatchingSnapshot();
        });
    });

    describe('bool', () => {
        it.each<[any, boolean]>([
            ['yes', true],
            ['no', false],
            ['on', true],
            ['off', false],
            ['1', true],
            ['0', false],
            [1, true],
            [0, false]
        ])('converts to bool: %s - %s', (value, expected) => {
            expect(validations.bool(value))
                .toEqual(expected);
        });

        it('throws error if cannot be converted to bool', () => {
            expect(() => {
                validations.bool('some strange value')
            })
                .toThrowErrorMatchingSnapshot();
        });
    });

    describe('url', () => {
        describe('validation', () => {
            const validator = validations.url;

            it('success', () => {
                expect(validator('http://9marshals.com'))
                    .toEqual('http://9marshals.com')
            });

            it('failure', () => {
                expect(() => {
                    validator('test')
                })
                    .toThrowErrorMatchingSnapshot();
            })
        });

        describe('requiring protocol', () => {
            const validator = validations.url.options({protocols: ['http']});
            it('success', () => {
                expect(validator('http://9marshals.com'))
                    .toEqual('http://9marshals.com');
            });

            it('failure', () => {
                expect(() => {
                    validator('ftp://9marshals.com')
                })
                    .toThrowErrorMatchingSnapshot();
            });
        })
    });
});
