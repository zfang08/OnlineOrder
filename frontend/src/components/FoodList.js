import { Button, Card, List, message, Select, Tooltip} from "antd";
import { useEffect, useState } from "react";
import { addItemToCart, getMenus, getRestaurant } from "../utils";
import { PlusOutlined} from "@ant-design/icons";
import Item from "antd/lib/list/Item";

const { Option } = Select;

// 增加物品到购物车, 用户传入了一个object， 我们直接destructure 出来了这个object 的id

// 函数组件：我们有一个AddToCartButton 的函数组件职责就是渲染一个加入购物车的按钮
// 点击按钮时调用后端接口

// 这里为什么ToolTip和按钮要被返回？
    // 因为react 的组件核心就是接受函数， 然后return 一段jsx作为UI 要显示的内容
const AddToCartButton = ({itemId}) => {
    const[loading, setLoading] = useState(false);

    const AddToCart = () => {
        setLoading(true);
        addItemToCart(itemId)
            .then(() =>{ message.success("Item added successfully!")})
            .catch(() => {message.error("Cannot add item to cart!")})
            .finally(() => {setLoading(false);})
    };

    return <Tooltip title="Add to Shopping Cart">
        <Button
        loading={loading}
        type="primary"
        icon={<PlusOutlined />}
        onClick={AddToCart}
        />
    </Tooltip>
};

// 核心业务逻辑：
    // 去后端把所有的餐厅拿出来， 然后用户选中其中一家餐厅， 我们展示这一家餐厅的菜单渲染成卡片表单

const FoodList = () => {

    // 这里我们设定了5 个状态。
    const [foodData, setFoodData] = useState([]);               // 第一个就是一个餐厅的food data
    const [curRest, setCurRest] = useState();                   // 这个时当前选中餐厅的id
    const [restaurants, setRestaurants] = useState([]);         // 这个是餐厅的列表

    const [loading, setLoading] = useState(false);              // 这个是选中一个餐厅时候， 读取菜单时候时的状态
    const [loadingRest, setLoadingRest] = useState(false);      // 这个时在选餐厅时候， 读取餐厅列表的状态

    // 1. 获取餐厅信息， 在组件渲染之后， 执行这里面的副作用逻辑
    useEffect(() => {
        setLoadingRest(true);

        getRestaurant()
        .then((data) => {
            setRestaurants(data)           // 这里用utils写好的api请求函数获取餐厅data， 然后存到我们的餐厅列表状态
        })
        .catch(() => {message.error("Cannot Get Restaurants - Try Again Later.")})
        .finally(() => {
            setLoadingRest(false)
        })
    }, []);
    // dependency array 这里不理解： 页面第一次出来的时候跑一次，以后不再因为 state 更新而重复跑。



    // 2. 获取选中餐厅的菜单信息。
    useEffect(() => {

        // 如果说我们选中了一个餐厅， 我们就把loading菜单状态设置为true， 然后我们调用写好的utils请求函数去后端获取
        // 当前餐厅的数据。 有东西， 就给它存到我们的FoodData 列表。
        if(curRest){
            setLoading(true)
            getMenus(curRest)
            .then((data) => {
                setFoodData(data)
            })
            .catch(() => {message.error("Cannot Get Menus - Try Again Later.")})
            .finally(() => {
                setLoading(false)
            })
        }
    }, [curRest]);  // 这个 effect 会在初次渲染后执行一次，并且以后每次 curRest 变化时重新执行


    // 返回一个UI 的东西
    return (
    <>
      <Select
        value={curRest}
        onSelect={(value) => setCurRest(value)}
        placeholder="Select a restaurant"
        loading={loadingRest}
        style={{ width: 300 }}
        onChange={() => {}}
      >

        {restaurants.map((item) => {
          return <Option value={item.id}>{item.name}</Option>;
        })}

      </Select>


      {curRest && (
        <List
          style={{ marginTop: 20 }}
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 3,
            xxl: 3,
          }}
          dataSource={foodData}
          renderItem={(item) => (
            <List.Item>
              <Card
                title={item.name}
                extra={<AddToCartButton itemId={item.id} />}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: "100%", display: "block" }}
                />
                {`Price: ${item.price}`}
              </Card>
            </List.Item>
          )}
        />
      )}
    </>
  );
};


export default FoodList;
