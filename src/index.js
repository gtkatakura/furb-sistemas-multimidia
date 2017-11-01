import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Root from './components/Root';

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component>Ola</Component>
    </AppContainer>,
    document.getElementById('app'),
  );
};

render(Root);

if (module.hot) {
  module.hot.accept('./components/Root', () => { render(Root); });
}
