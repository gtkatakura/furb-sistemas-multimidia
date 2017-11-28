import React from 'react';
import { slide as BurgerMenu } from 'react-burger-menu';
import { Link } from 'react-router-dom';

import './index.less';

const Menu = () => (
  <BurgerMenu>
    <Link to="/exercises">Exercícios</Link>
  </BurgerMenu>
);

export default Menu;
