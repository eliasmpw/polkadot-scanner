import React from "react";
import { Col, Layout, Row, Space } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Navbar.less";

function NavbarComponent(): React.ReactElement {
  const isAdmin = useSelector((state: any) => state.user.isAdmin);

  const logout = async () => {
    // Reloading and sending an invalid authorization header to prompt the
    // navigator to ask for a valid login again
    axios.get("/static/images/symbol-polkadot.svg", {
      headers: {
        Authorization: "Basic invalid",
      },
    });
    window.location.reload(true);
  };

  return (
    <Layout.Header className="app-header">
      <Row wrap={false}>
        <Col flex="none">
          <Link to="/">
            <Space className="header-home">
              <img
                className="header-logo"
                src="/static/images/symbol-polkadot.svg"
                alt="Logo"
              />
              <div className="logo-text">Scanner</div>
            </Space>
          </Link>
        </Col>
        <Col flex="1 1">
          <Row justify="end">
            {isAdmin && (
              <Link to="/create-user">
                <div className="user-btn">Create User</div>
              </Link>
            )}
            <div className="logout-btn" onClick={logout}>
              Logout
            </div>
          </Row>
        </Col>
      </Row>
    </Layout.Header>
  );
}

export default NavbarComponent;
