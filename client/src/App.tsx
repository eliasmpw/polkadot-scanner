import React, { useEffect } from "react";
import { Layout, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Scanner from "./pages/Scanner";
import Error404 from "./pages/Error404";
import NavbarComponent from "./components/NavbarComponent";
import CreateUser from "./pages/CreateUser";
import CustomSpinner from "./components/CustomSpinner";
import PrivateRoute from "./components/PrivateRoute";
import "./App.less";
import { checkIfUserIsAdmin } from "./store/actions/userActions";

function App(): React.ReactElement {
  const isLoading = useSelector((state: any) => state.user.isLoading);
  const isAdmin = useSelector((state: any) => state.user.isAdmin);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkIfUserIsAdmin());
  }, []);

  return (
    <BrowserRouter>
      <Spin spinning={isLoading} indicator={CustomSpinner}>
        <Layout className="app-layout">
          <NavbarComponent />
          <Layout.Content className="app-content">
            <Switch>
              <Route exact path="/" component={Scanner} />
              <PrivateRoute
                exact
                path="/create-user"
                component={CreateUser}
                isAdmin={isAdmin}
              />
              <Route component={Error404} />
            </Switch>
          </Layout.Content>
        </Layout>
      </Spin>
    </BrowserRouter>
  );
}

export default App;
