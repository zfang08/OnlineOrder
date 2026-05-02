import { Layout, Typography} from "antd";
import { useState } from "react";
import FoodList from "./components/FoodList";
import MyCart from "./components/MyCart";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";

// 从antd 里面提取出来我们要用的布局组件
const { Header, Content } = Layout;
const{ Title } = Typography;


// 这个是整个页面的入口组件
const App = () => {
  const[authed, setAuthed] = useState(false);

  return <Layout style={{height: "100vh"}}>

    <Header style={{color:"white"}}>
      <div className="header" style = {{display:"flex", justifyContent:"space-between"}}>
        <Title level={2} style={{color: "white", lineHeight: "inherit", marginBottom: 0}}>
          Food Ordering System
        </Title>

        <div>
          {/* 更具是否login来决定显示我的购物车或者是signupForm */}
          {authed ? <MyCart/> : <SignupForm/>}
        </div>
      </div>
    </Header>

    <Content style = {{
      padding: "50px",
      maxHeight:"calc(100% - 64px)",
      overflowY: "auto",
      }}
    >
      {/* // 所以这里一开始记住了是没有登录所以给我们看的就是这个loginForm, 然后如果成功了， 就把authed 状态改为真，
      // 后因为状态改变， 重新渲染变成了 content placeholder */}
      {authed ? (
          <FoodList />
        ) : (
          <LoginForm onSuccess={() => setAuthed(true)} />
        )}
    </Content>
  </Layout>
}

export default App;
