import React from "react";
import { Route } from "react-router-dom";
import Error403 from "../pages/Error403";

function PrivateRoute({
  component,
  isAdmin,
  ...otherProps
}: any): React.ReactElement {
  const Component = component;
  return (
    <Route
      {...otherProps}
      render={(props) => (isAdmin ? <Component {...props} /> : <Error403 />)}
    />
  );
}

export default PrivateRoute;
