import React from 'react';
import PropTypes from 'prop-types';

class Login extends React.Component {
  onClick() {
    this.props.onStart(this.nameField.value);
  }

  render() {
    return (
      <main>
        <div className="inner">
          <input ref={el => { this.nameField = el; }} className="form-control" type="text" placeholder="Apelido" autoFocus />
          <button type="button" className="btn btn-success margin-top" onClick={this.onClick.bind(this)}>Jogar</button>
        </div>
      </main>
    );
  }
}

Login.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default Login;
