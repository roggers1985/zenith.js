type Matcher<T, U> = {
    result: U | null;
    when: (
        value: boolean | T | ((value: T) => boolean),
        then: (value: T) => U
    ) => Matcher<T, U>;
    orElse: (fn: () => U) => U;
    matched: boolean;
};

export function match<T, U>(
    value: T,
    options?: { deep: boolean }
): Matcher<T, U> {
    return {
        get matched() {
            return this.result !== null;
        },
        result: null,
        when(input, then) {
            if (this.matched) {
                // skip the rest
            } else if (input === true) {
                this.result = then(value);
            } else if (input instanceof Function && input(value)) {
                this.result = then(value);
            } else if (input === value) {
                this.result = then(value);
            }

            return this;
        },
        orElse(fn) {
            if (this.matched) {
                return this.result as U;
            }
            return fn();
        },
    };
}
