import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Menu from '../Menu';

import Rank from '../Rank';
import GameSet from '../GameSet';

import './index.less';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      userName: null,
    };
  }

  onClick() {
    this.setState({
      userName: this.nameField.value,
    });
  }

  render() {
    return (
      <Router>
        {this.state.userName ? (<div id="outer-container">
          <Menu />
          <main id="page-wrap">
            <Switch>
              <Route exact path="/" component={Rank} />
              <Route path="/exercises" component={GameSet} />
            </Switch>
          </main>
        </div>) : (<main>
          <div className="inner">
            <input ref={el => { this.nameField = el; }} className="form-control" type="text" placeholder="Apelido" autoFocus />
            <button type="button" className="btn btn-success margin-top" onClick={this.onClick.bind(this)}>Jogar</button>
          </div>
        </main>)}
      </Router>
    )
  }
}
