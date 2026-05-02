import { Button, Form, Input, message, Modal } from "antd";  // 把一些
import React from "react";
import {LockOutlined, UserOutlined} from "@ant-design/icons";   // 把这两个icon 导入
import { signup } from "../utils";

class SignupForm extends React.Component{
    state = {
        displayModal : false,
    }

    handleCancel = () => {
        this.setState({
            displayModal : false,
        });
    };

    signupOnClick = () => {
        this.setState({
            displayModal : true,
        });
    };

    onFinish = (data) =>{
        //如果signup 成功, 我们关掉滑窗， 然后打印文字注册成功
        signup(data)
        .then(() => {
            this.setState({
                displayModal : false,
            });

            message.success("sign up successful!");
        })
        .catch(() => {
            message.error("signup failed");
        });
    };

    render = () =>{
        return <div>
            {/* 先写一个button 调用我们写好的signupOnClick 函数 */}
            <Button shape = "round" type = "primary" onClick={this.signupOnClick}>
                Register
            </Button>


            {/* 写一个Modal滑窗 调用我们写好的signupOnClick 函数 */}
            <Modal
                title = "Register"
                open = {this.state.displayModal}
                onCancel = {this.handleCancel}
                footer = {null}
                destroyOnClose = {true}
                >
                {/* 把之前form 写好的东西删掉如果关了的话 */}

                <Form
                    name = "normal_Register"
                    initialValues = {{remember:true}}
                    onFinish = {this.onFinish}
                    preserve = {false}
                    >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: "Please input your email!" }]}
                    >
                    <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: "Please input your password!" },
                        ]}
                    >
                    <Input prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="first_name"
                        rules={[
                            { required: true, message: "Please input your first name!" },
                        ]}
                    >
                    <Input placeholder="firstname" />
                    </Form.Item>

                    <Form.Item
                    name="last_name"
                    rules={[
                        { required: true, message: "Please input your last name!" },
                    ]}
                    >
                    <Input placeholder="lastname" />
                    </Form.Item>

                    <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    };
}

export default SignupForm;
