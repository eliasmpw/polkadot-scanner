import React from "react";
import { Button, Layout, Result } from "antd";

const Error403 = (): React.ReactElement => {
  return (
    <Layout>
      <Layout.Content>
        <Result
          status="403"
          title="403"
          subTitle={"You don't have permission to see this page."}
          extra={
            <Button type="primary" href="/">
              Go back to homepage
            </Button>
          }
        />
      </Layout.Content>
    </Layout>
  );
};

export default Error403;
