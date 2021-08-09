import React from "react"
import { Button } from "antd"
import { Layout } from "antd"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Scanner from "./pages/Scanner"
import Error404 from "./pages/Error404"
import NavbarComponent from "./components/NavbarComponent"
import "./App.less"

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Layout className='app-layout'>
        <NavbarComponent />
        <Layout.Content className='app-content'>
          <Switch>
            <Route exact path='/' component={Scanner} />
            <Route component={Error404} />
          </Switch>
        </Layout.Content>
        {/* <Layout.Footer className='app-footer'>
          ©2021 by Elias Poroma
        </Layout.Footer> */}
      </Layout>
    </BrowserRouter>
  )
}

export default App
