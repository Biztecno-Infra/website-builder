interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    cancel: () => void;
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): DebouncedFunction<T> {
    let timer: ReturnType<typeof setTimeout>;

    const debounced = function (this: any, ...args: Parameters<T>) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    } as DebouncedFunction<T>;

    debounced.cancel = () => {
        clearTimeout(timer);
    };

    return debounced;
}