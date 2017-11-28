import React from 'react';
import * as Paginate from 'react-paginate';
import _ from 'lodash';

import ExercisesFactory from '../../domain/ExercisesFactory';
import Game from '../Game';

export default class GameSet extends React.Component {
  constructor() {
    super();

    this.exercises = ExercisesFactory();
    this.state = {
      exercise: _.first(this.exercises),
    };
  }

  onPageChange({ selected }) {
    this.setState({
      exercise: this.exercises[selected],
    });
  }

  render() {
    return (
      <div>
        <Paginate
          previousLabel="<"
          nextLabel=">"
          breakClassName="break-me"
          marginPagesDisplayed={2}
          pageRangeDisplayed={10}
          pageCount={this.exercises.length}
          containerClassName="pagination"
          subContainerClassName="pages pagination"
          activeClassName="active"
          onPageChange={this.onPageChange.bind(this)}
        />
        <Game exercise={this.state.exercise} />
      </div>
    );
  }
}
