const Component = () => {
  let element = document.createElement('div');
  let button = document.createElement('button');
  let br = document.createElement('br');

  button.innerHTML = '单击我加载 print.js';
  element.innerHTML = "hello world~";
  element.appendChild(br);
  element.appendChild(button);
  button.onclick = () => import('./print')
    .then((m) => {
      console.log(m);
      m.default();
    });
  return element;
}

document.body.appendChild(Component());
