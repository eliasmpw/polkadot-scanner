import React from "react"
import { Button, Layout, Result } from "antd"

const Error404 = () => {
  return (
    <Layout>
      <Layout.Content>
        <Result
          status='404'
          title='404'
          subTitle={"This page doesn't exist"}
          extra={
            <Button type='primary' href='/'>
              Go back to homepage
            </Button>
          }
        />
      </Layout.Content>
    </Layout>
  )
}

export default Error404
