export function setupCounter(element) {
  let counter = parseInt(localStorage.getItem('counter')) || 0;

  const setCounter = (count) => {
    counter = count;
    localStorage.setItem('counter', counter);
    element.innerHTML = `count is ${counter}`;
  };

  element.addEventListener('click', () => setCounter(counter + 1));

  setCounter(counter);
}
