import React, { useState } from "react";
import { Button, Col, Form, Input, message, Row, Select, Spin } from "antd";
import axios from "axios";
import CustomSpinner from "../components/CustomSpinner";
import "./CreateUser.less";

function CreateUser(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const onFormSubmit = async (values: any) => {
    // Attempt to create user
    setIsLoading(true);
    const response = await axios.post("/api/users", values).catch((err) => {
      message.error(
        err.response?.data?.msg ||
          "Unexpected error when trying to create a new user"
      );
    });
    if (response) {
      message.success("User created successfully");
      form.resetFields();
    }
    setIsLoading(false);
  };

  return (
    <Spin spinning={isLoading} indicator={CustomSpinner}>
      <Row justify="center">
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 12 }}>
          <div className="create-user-container">
            <h2>Create a new User</h2>
            <Form
              layout="vertical"
              name="create-user-form"
              form={form}
              initialValues={{
                role: "regular",
              }}
              onFinish={onFormSubmit}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please enter a username",
                  },
                ]}
              >
                <Input placeholder="Enter username..." />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter a password!",
                  },
                  {
                    min: 5,
                    message: "Password must be at least 5 characters",
                  },
                ]}
              >
                <Input.Password placeholder="Enter password..." />
              </Form.Item>
              <Form.Item
                label="Role"
                name="role"
                rules={[
                  {
                    required: true,
                    message: "Please select an option",
                  },
                ]}
              >
                <Select placeholder="Select an option...">
                  <Select.Option value="regular">Regular</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item className="mb-0">
                <Row justify="end">
                  <Button type="primary" htmlType="submit">
                    Create
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </Spin>
  );
}

export default CreateUser;
