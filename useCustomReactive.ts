import { useEffect, useReducer } from 'react';
import { FlatReactive, Reactive } from '../modules/editor/reactive';

export function useCustomReactive<V>(reactive: Reactive<V>): [V, (value: V) => void] {
  const [, forceUpdateComponent] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const subscription = () => {
      forceUpdateComponent();
    };

    reactive.subscribeToValueChange(subscription);

    return () => {
      reactive.unsubscribeFromValueChange(subscription);
    };
  }, [reactive]);

  function setValue(value: V) {
    reactive.value = value;
  }

  return [reactive.value, setValue];
}

export function useCustomFlatReactive<T extends object, K extends keyof T>(
  reactive: FlatReactive<T>,
  key: K
): [FlatReactive<T>[K], (value: FlatReactive<T>[K]) => void] {
  const [, forceUpdateComponent] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const subscription = () => {
      forceUpdateComponent();
    };

    reactive.subscribeToKeyValueChange(key, subscription);

    return () => {
      reactive.unsubscribeToKeyValueChange(key, subscription);
    };
  }, [reactive, key]);

  function setValue(value: FlatReactive<T>[K]) {
    reactive[key] = value;
  }

  return [reactive[key], setValue];
}
