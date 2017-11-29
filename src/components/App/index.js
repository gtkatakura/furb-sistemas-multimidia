import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Menu from '../Menu';

import Rank from '../Rank';
import GameSet from '../GameSet';

import './index.less';

const Root = () => (
  <Router>
    <div id="outer-container">
      <Menu />
      <main id="page-wrap">
        <Switch>
          <Route exact path="/" component={Rank} />
          <Route path="/exercises" component={GameSet} />
        </Switch>
      </main>
    </div>
  </Router>
);

export default Root;
