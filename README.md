# reactive
A simple single file no dependency vannila variable reactivity module for typescript

## Usage
```ts
import { Reactive, createFlatReactive } from "./reactive";

// For primitive values use the `Reactive` object

const count = new Reactive(0); // Type will get automatically inferred

count.subscribeToValueChange((oldVal, newVal) => {
  console.log(`Value changed from ${oldVal} to ${newVal}`);
});

count.value = 5; // Triggers log "Value changed from 0 to 5"

count.forceUpdate(); // Triggers log "Value changed from 5 to 5"
// Force updating can be used when the value is an array and you want to modify the array without recreating the array object it self and then send an update about the change to the subscribers

// ------------------------------
// ------------------------------
// ------------------------------

// For reacting to changes in objects use `createFlatReactive`

const user = createFlatReactive({
  name: "HonzaKubita",
  email: "kubita@linux.com",
  id: "a123",
  role: "Admin",
});

user.subscribeToKeyValueChange("name", (oldVal, newVal) => {
  console.log(`User previously known as ${oldVal} is now named ${newVal}`);
});

user.name = "qb1t"; // Triggers a log "User previously known as HonzaKubita is now named qb1t"

user.forceKeyUpdate("name"); // Triggers a log "User previously known as qb1t is now named qb1t"
// This exists for the same reasons as `Reactive.forceUpdate()`

user.forceGlobalUpdate(); // Triggers a log "User previously known as qb1t is now named qb1t"
// Use this when you just want to trigger an update on all of the keys of the object

// ------------------------------
// ------------------------------
// ------------------------------

// You can also unsubscribe your subscribers from Reactive objects for cleanup or any other reason

const count2 = new Reactive(0);

const count2Subscriber = (oldVal: number, newVal: number) => {
  console.log(`Value changed from ${oldVal} to ${newVal}`);
};

count2.subscribeToValueChange(count2Subscriber);

count2.value = 1; // Triggers log "Value changed from 0 to 1"

count2.unsubscribeFromValueChange(count2Subscriber);

count2.value = 5; // Triggers nothing as there are no subscribers

// ------------------------------

// Same applies for FlatReactive

const user2 = createFlatReactive({ name: "Bot" });

const user2NameSubscriber = (oldVal: string, newVal: string) => {
  console.log(`Username of user2 changed from ${oldVal} to ${newVal}`);
};

user2.subscribeToKeyValueChange("name", user2NameSubscriber);

user2.name = "Human"; // Triggers log "Username of user2 changed from Bot to Human"

user2.unsubscribeToKeyValueChange("name", user2NameSubscriber);

user2.name = "Cat"; // Triggers nothing as there are no subscribers
```

## React integration

You can find a react hook in `useCustomReactive.ts` this hook basically makes it so that you can use your custom Reactive objects as state variables
which can be used as follows:

```tsx
import { useCustomReactive, useCustomFlatReactive } from "./useCustomReactive"
import { reactiveCount } from "./wherever/whichever/counter"
import { flatReactiveUser } from "./wherever/whichever/user"

export function SomeComponent() {
  const [count, setCount] = useCustomReactive(reactiveCount);
  const [username, setUsername] = useCustomFlatReactive("name", flatReactiveUser);

  // Use as you would use any `useState` variable
  // Changing the value outside of this component will trigger a re-render of this component and likewise changing it here will trigger a callback on all of the subscribers

  return <div>
    <p>{count}<p>
    <button @onClick={() => count.value++}>Add Count</button>
    <hr>
    <p>{username}<p>
    <input type="text" onChange={e => setUsername(e.target.value)}>
  </div>
}
```
