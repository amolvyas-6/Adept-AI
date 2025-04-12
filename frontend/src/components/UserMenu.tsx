import { useState } from 'react';
import './UserMenu.css'; // Import the CSS file for styling
import { removeToken } from '../lib/api';

const UserMenu = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
  
  const removeHandler = () => {
    removeToken()
      .then(() => {
        alert("Token Removed");
      })
      .catch((error) => {
        alert("Error removing token:" + error.message);
      });
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? '>' : '<'}
      </button>
      <ul>
        {/* <li><a href="/login" className="menu-item"><span>🔑</span>{!isCollapsed && 'Login'}</a></li>
        <li><a href="/notifications" className="menu-item"><span>🔔</span>{!isCollapsed && 'Notifications'}</a></li> */}
        <li><a href="/" className="menu-item"><span>🏠</span>{!isCollapsed && 'Home'}</a></li>
        <li><a href="/inputNotes" className="menu-item"><span>📊</span>{!isCollapsed && 'Add Notes'}</a></li>
        <li><a href="/roadmap" className="menu-item"><span>🛣️</span>{!isCollapsed && 'Display Roadmap'}</a></li>
        <li><a onClick={removeHandler}><span>🗑️</span>{!isCollapsed && 'Delete GAuth'}</a></li>
      </ul>
    </div>
  );
};

export default UserMenu
