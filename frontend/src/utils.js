// 定义了一个函数叫做login，这个函数会用credentials向后端发一个登录请求

// POST: 去做登录
export const login = (credentials) => {
    // 这个函数里面存了loginUrl 这个变量， 这个是把crendentials拼接成为一个url
    const loginUrl = `login?username=${credentials.username}&password=${credentials.password}`;

    // 用 fetch 向后端发一个 POST 请求
    return fetch(loginUrl, {
        method:"POST",
        headers:{
            "Content-type":"application/json"
        }
    }) // .then 返回的是一个promise
    .then((response) => {
        if(response.status < 200 || response.status >= 300){
            throw Error("Fail to login")
        }
    });

    // fetch 返回的是一个promise， 后面可以加一个.then, 我等你fetch 返回之后再进行下一步。
};

// POST: 这里定义了一个新的signup 函数， 传入一个data
export const signup = (data) =>{
    const signupUrl = "/signup";


    return fetch(signupUrl, {
        method: "POST",
        headers:{
            "Content-type":"application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
        if(response.status < 200 || response.status >= 300){
            throw Error("Fail to signup")
        }
    });

};

// GET：获取指定餐厅的菜单
export const getMenus = (restId) => {
    // 给我一个餐厅的id， 然后我直接用这个id 去fetch 后端该餐厅的菜单
    return fetch(`/restaurant/${restId}/menu`)

    // promise， 如果response 有问题了， 那么我们throw error
    .then((response) => {
        if(response.status < 200 || response.status >= 300){
            throw Error("Fail to getMenu")
        }

        // 否则， 如果上面没有报错， 说明fetch 成功了， 我们就返回该餐厅的菜单
        return response.json();
    });
};

// GET: 获取所有的餐厅的菜单
export const getRestaurant = () => {
    // 直接去找所有的餐厅的菜单
    return fetch(`/restaurants/menu`)

    // promise， 如果response 有问题了， 那么我们throw error
    .then((response) => {
        if(response.status < 200 || response.status >= 300){
            throw Error("Fail to getRestaurant")
        }

        // 否则， 如果上面没有报错， 说明fetch 成功了， 我们就返回该餐厅的菜单
        return response.json();
    });
}

// GET: 获取购物车
export const getCart = () => {
    return fetch("/cart").then((response) => {
    if (response.status < 200 || response.status >= 300) {
        throw Error("Fail to get shopping cart data");
    }
    return response.json();
    });
};

// POST: 清空购物车
export const checkout = () => {
    return fetch("/cart/checkout", {
        method: "POST",
        headers: {
    "Content-Type": "application/json",
    },
}).then((response) => {
    if (response.status < 200 || response.status >= 300) {
        throw Error("Fail to checkout");
    }
    });
};

// POST： 把物品加入购物车
export const addItemToCart = (itemId) => {
    const payload = {
    menu_id: itemId,
};

return fetch(`/cart`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",},
    body: JSON.stringify(payload),
    })
    .then((response) => {
        if (response.status < 200 || response.status >= 300) {
            throw Error("Fail to add menu item to shopping cart");
        }
    });
};
