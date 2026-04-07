export function useDefer() {
  const counter = ref(1);
  function update() {
    counter.value++;
    console.log(counter.value);
    requestAnimationFrame(update);
  }

  update();
  return n => counter.value >= n;
}
