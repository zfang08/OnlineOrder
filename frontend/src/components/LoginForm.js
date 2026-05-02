import { Button, Form, Input, message } from "antd";
import React from "react";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import { login } from "../utils";

class LoginForm extends React.Component{
    state = {
        loading: false,
    }

    onFinish = (data) => {
        this.setState({
            loading: true,
        });

        // 我们调用之前写好的，去调用后端的，叫做login的，函数。
        // 一般用法， 这个promise 甩锅， 接锅， 不管报错与否， 我都要运行的。
        login(data)
            .then(() => {
                message.success("Login succeeded!");
                this.props.onSuccess();
            })
            .catch((err) => {
                message.error("Somthing went wrong! Try again later");
            })
            .finally(() =>{
                this.setState({
                    loading: false,
                });
            });
    }

    render = () => {
    return (
      <Form
        name="normal_login"
        onFinish={this.onFinish}
        style={{
          width: 300,
          margin: "auto",
        }}
>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
        <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={this.state.loading}>
            Login
          </Button>
        </Form.Item>

      </Form>
    );
  };


};

export default LoginForm;
