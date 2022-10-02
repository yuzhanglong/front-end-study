// const el = require('./element.js')；
// const ul = el('ul', {id: 'list'}, [
//   el('li', {class: 'item'}, ['Item 1']),
//   el('li', {class: 'item'}, ['Item 2']),
//   el('li', {class: 'item'}, ['Item 3'])
// ])；
//
// const ulRoot = ul.render();
// document.body.appendChild(ulRoot);
//
// dom输出：
// <ul id='list'>
// <li class='item'>Item 1</li>
// <li class='item'>Item 2</li>
// <li class='item'>Item 3</li>
// </ul>

interface VDOMNode {
  tagName: string;
  attributes: Record<string, any>;
  children: (VDOMNode | string)[];
}

const el = (
  tagName: string,
  attributes: Record<string, any>,
  children: (VDOMNode | string)[]
): VDOMNode => {
  return {
    tagName,
    attributes,
    children,
  };
};

const dom = el('ul', { id: 'list' }, [
  el('li', { class: 'item' }, ['Item 1']),
  el('li', { class: 'item' }, ['Item 2']),
  el('li', { class: 'item' }, ['Item 3']),
]);

const renderNode = (node: VDOMNode) => {
  const { tagName, attributes, children } = node;
  const el = document.createElement(tagName);
  for (let [k, v] of Object.entries(attributes)) {
    el.setAttribute(k, v);
  }
  const childNodes = children.map((child) => {
    if (typeof child === 'string') {
      return document.createTextNode(child);
    } else {
      return renderNode(child);
    }
  });

  for (let childNode of childNodes) {
    el.appendChild(childNode);
  }

  return el;
};
