const myWorker = new Worker('worker.js');

const first = document.getElementById('first-input');

const second = document.getElementById('second-input');

first.addEventListener('change', () => {
  myWorker.postMessage([first.value, second.value]);
});

second.addEventListener('change', () => {
  myWorker.postMessage([first.value, second.value]);
});

myWorker.onmessage = (e) => {
  console.log(e.data);
};
