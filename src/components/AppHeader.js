import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserProvider';

const AppHeader = () => {
  const { user, handleLogout, handleLogin } = useContext(UserContext);

  return (
    <header className="AppHeader">
      <Link className="AppHeader-title" to={{ pathname: "/" }}>Chip Player JS</Link>
      {user ?
        <>
          {' • '}
          已登录 {user.displayName}.
          {' '}
          <a href="#" onClick={handleLogout}>登出</a>
        </>
        :
        <>
          {' • '}
          <a href="#" onClick={handleLogin}>登录/注册</a> 以开启收藏
        </>
      }
      {' • '}
      <a href="https://twitter.com/messages/compose?recipient_id=587634572" target="_blank" rel="noopener noreferrer">
        反馈
      </a>
    </header>
  );
}

export default AppHeader;
