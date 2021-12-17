import React from 'react';
import { isFunction } from 'lodash';

const App = () => {
  const RemoteButton = React.lazy(() => import('app2/Button'));
  console.log(RemoteButton);
  console.log(isFunction(RemoteButton));
  return (
    <div>
      <h1>Basic Host-Remote</h1>
      <h2>App 1</h2>
      <React.Suspense fallback="Loading Button">
        <RemoteButton />
      </React.Suspense>
    </div>
  );
};

export default App;
