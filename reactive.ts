type ReactiveSubscriber<T> = (value: T, oldValue: T) => void;

export class Reactive<T> {
  private _subscribers: ReactiveSubscriber<T>[] = [];
  public value: T;

  constructor(value: T) {
    this.value = value;

    return new Proxy<Reactive<T>>(this, {
      set(target, prop, value) {
        if (prop === 'value') {
          const oldVal = target.value;

          target[prop] = value;

          target._subscribers.forEach((subscriber) => subscriber(value, oldVal));
        } else {
          // @ts-expect-error // Impossible to type check
          target[prop] = value;
        }

        return true;
      },
    });
  }

  subscribeToValueChange(subscriber: ReactiveSubscriber<T>) {
    if (this._subscribers.includes(subscriber)) {
      return; // Prevent duplicate subscriptions
    }
    this._subscribers.push(subscriber);
  }

  unsubscribeFromValueChange(subscriber: ReactiveSubscriber<T>) {
    const index = this._subscribers.indexOf(subscriber);
    if (index !== -1) {
      this._subscribers.splice(index, 1);
    }
  }

  forceUpdate() {
    // This method can be used to force an update in components that are subscribed to this reactive object
    this._subscribers.forEach((subscriber) => subscriber(this.value, this.value));
  }
}

export type FlatReactive<Source extends object> = Source & {
  _subscribers: Partial<{
    [K in keyof Source]: ReactiveSubscriber<Source[K]>[];
  }>;

  subscribeToKeyValueChange: <K extends keyof Source>(
    key: K,
    subscriber: ReactiveSubscriber<Source[K]>
  ) => void;

  unsubscribeToKeyValueChange: <K extends keyof Source>(
    key: K,
    subscriber: ReactiveSubscriber<Source[K]>
  ) => void;

  forceKeyUpdate: <K extends keyof Source>(key: K) => void;
  forceGlobalUpdate: () => void;
};

export function createFlatReactive<T extends object>(source: T) {
  const flatReactive = source as FlatReactive<T>;

  flatReactive._subscribers = {};

  flatReactive.subscribeToKeyValueChange = <K extends keyof T>(
    key: K,
    subscriber: ReactiveSubscriber<T[K]>
  ) => {
    const list = (flatReactive._subscribers[key] ??= []);
    if (list.includes(subscriber)) return;
    list.push(subscriber);
  };

  flatReactive.unsubscribeToKeyValueChange = <K extends keyof T>(
    key: K,
    subscriber: ReactiveSubscriber<T[K]>
  ) => {
    const list = flatReactive._subscribers[key];
    if (!list) return;

    const idx = list.indexOf(subscriber);
    if (idx !== -1) list.splice(idx, 1);
  };

  flatReactive.forceKeyUpdate = <K extends keyof T>(key: K) => {
    const list = flatReactive._subscribers[key];
    if (!list) return;

    const value = flatReactive[key];
    list.forEach((sub) => sub(value, value));
  };

  flatReactive.forceGlobalUpdate = () => {
    (Object.keys(flatReactive._subscribers) as (keyof T)[]).forEach((key) => {
      const list = flatReactive._subscribers[key];
      if (!list) return;

      const value = flatReactive[key];
      list.forEach((sub) => sub(value, value));
    });
  };

  const proxy = new Proxy(flatReactive, {
    set(target, prop, value) {
      // Only react to "real" keys of T; ignore internal props like _subscribers
      if (!(prop in source)) {
        target[prop as keyof T] = value;
        return true;
      }

      const key = prop as keyof T;
      const oldVal = target[key];
      target[key] = value;

      const list = target._subscribers[key];
      if (list) {
        list.forEach((subscriber) => subscriber(target[key], oldVal));
      }
      return true;
    },
  });

  return proxy;
}
