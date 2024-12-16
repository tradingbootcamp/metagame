import { useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce";

// https://www.developerway.com/posts/debouncing-in-react?ht-comment-id=13350358
export function useDebounce<T extends unknown[], S>(
  callback: (...args: T) => S,
  delay: number = 1000,
  debounceOptions?: Parameters<typeof debounce>[2],
) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...arg: T) => {
      return ref.current(...arg);
    };

    return debounce(func, delay, debounceOptions);
  }, [delay]);

  return debouncedCallback;
}
