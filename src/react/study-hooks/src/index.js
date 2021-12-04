import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export const render = () => {
  ReactDOM.render(<App />, document.getElementById('root'));
};

render();
