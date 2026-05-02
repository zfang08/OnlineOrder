import {Button, Drawer, List, message, Typography} from "antd";
import { useEffect, useState } from "react";
import { checkout, getCart } from "../utils";

const { Text } = Typography;
const MyCart = () => {

    // 这里定义了4个状态
    const [cartVisible, setCartVisible] = useState(false);    // 我们的购物车可见
    const [cartData, setCartData] = useState();            // 我们的cart 里面的东西
    const [loading, setLoading] = useState(false);             // 购物车的loading 状态， 初始为false
    const [checking, setChecking] = useState(false);

    useEffect(() => {

        // 如果从true 变成false 不需要调用api
        if(!cartVisible){
            return;
        }

        // 反之， 如果时false 变成true ， 我们需要调用
        setLoading(true);
        getCart()
            .then((data) => {
                setCartData(data)
            })
            .catch(() => {
                message.error("Failed to Load Cart - Try Again Later")
            })
            .finally(() =>{
                setLoading(false);
            });
    }, [cartVisible]);


    const onCheckOut = () => {
        setChecking(true);
        checkout()
            .then(() => {
                message.success("Successfully Checked Out!");
                setCartVisible(false);
            })
            .catch(() => {
                message.error("Something Went Wrong.")
            })
            .finally(() => {
                setChecking(false);
            })
    };

    const onCloseDrawer = () => {
        setCartVisible(false);
    };
    const onOpenDrawer = () => {
        setCartVisible(true);
    };

    return (<>
        <Button
            type = "primary"
            shape = "round"
            onClick = {onOpenDrawer}
        >
            Cart
        </Button>
            <Drawer
            title="My Shopping Cart"
            onClose={onCloseDrawer}
            open={cartVisible}
            width={520}
            footer={
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                }}
            >
                <Text
                strong={true}
                >{`Total price: $${cartData?.total_price}`}</Text>
                <div>

                <Button onClick={onCloseDrawer} style={{ marginRight: 8 }}>
                    Cancel
                </Button>

                <Button
                    onClick={onCheckOut}
                    type="primary"
                    loading={checking}
                    disabled={loading || cartData?.order_items.length === 0}
                >
                    Checkout
                </Button>

                </div>
            </div>
            }
        >
            <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={cartData?.order_items}
            renderItem={(item) => (
                <List.Item>
                <List.Item.Meta
                    title={item.menu_item_name}
                    description={`$${item.price}`}
                />
                </List.Item>
            )}
            />

        </Drawer>
    </>)
};

export default MyCart;
