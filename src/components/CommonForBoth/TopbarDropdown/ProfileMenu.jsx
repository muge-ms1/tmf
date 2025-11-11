import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
// users
import user1 from "../../../assets/images/users/avatar-1.jpg";
import Avatar from "../../Common/Avatar";

import "./ProfileMenu.css";
function ProfileMenu(props) {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState({});
  
  const navigate = useNavigate();
  const currentURL=useLocation();

  const lockscreen = () => {
    // localStorage.removeItem('access_token');
    // localStorage.removeItem('auth_user')
    localStorage.setItem('previousURL',currentURL.pathname)
    navigate('/lock-screen');
  }
  const logout = () =>{
    localStorage.removeItem("access_token");
    navigate('/login');
  }
  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
      setUser(obj);
    }
  }, [props.success]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user text-white"
            src={user1}
            alt="Header Avatar"
          />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <div className="d-flex align-items-center p-2">
            <Avatar
              name={user.username || user.name || 'User'}
              size={32}
              style={{ marginRight: '8px' }}
            />
            <div className="d-inline-block text-start" style={{ lineHeight: '1.2' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{user.username}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>
                {user.orgName ? user.orgName : "TMF"} • {user.employees?.length > 0 ? user.employees[0].branch_name : 'Main Branch'}
              </div>
            </div>
          </div>
          <Link to='/view' className="dropdown-item">
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            Org Settings
          </Link>
          <DropdownItem tag="a" onClick={lockscreen}>
            <i className="bx bx-lock-open font-size-16 align-middle me-1"  />
            Lock screen
          </DropdownItem>
          <DropdownItem onClick={logout} className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any
};

// const mapStatetoProps = state => {
//   const { error, success } = state.Profile;
//   return { error, success };
// };

export default ProfileMenu;
