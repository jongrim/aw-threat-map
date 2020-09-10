import * as React from 'react';

interface ReturnFunc<T> {
  (value: T): void;
  (setterFunc: (value: T) => T): void;
}

// Hook
function useLocalStorage<T>(key: string, initialValue: T): [T, ReturnFunc<T>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  let setValue: ReturnFunc<T>;
  type setter<T> = (arg0: T) => T;
  type value<T> = T | setter<T>;
  setValue = function (value: value<T>) {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      debugger;
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
