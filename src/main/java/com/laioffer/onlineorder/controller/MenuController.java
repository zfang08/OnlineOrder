package com.laioffer.onlineorder.controller;

import com.laioffer.onlineorder.entity.MenuItemEntity;
import com.laioffer.onlineorder.model.RestaurantDto;
import com.laioffer.onlineorder.service.MenuItemService;
import com.laioffer.onlineorder.service.RestaurantService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;


@RestController
public class MenuController {

    // 这里如果说我的controller 要用到依赖的class， 需要传入进来， 那么我们传入， 然后用构造函数去
    // 记住这件事就叫做 dependency injection.

    // spring boot 会自动new 这些class， 全都是DAG， 有向无环图， 也就是说new 的时候不会出现依赖cycle
    // 不可能往上游依赖回来， 没有死循环。
    // 悄无声息的帮助， 直接可以帮助我们new class。

    // IOC，
    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;


    // 会用到 restaurant service 和menuItemService 这两个service
    public MenuController(RestaurantService restaurantService, MenuItemService menuItemService) {
        this.restaurantService = restaurantService;
        this.menuItemService = menuItemService;
    }

    // 这里这个路径的意义是restaurantId是可以被替换掉的。
    // http://localhost:8080/ restaurant/1/menu
    // 这里的1就是餐馆的id， 这里就是告诉我们restaurantId是一个可以变的参数

    @GetMapping("/restaurant/{restaurantId}/menu")

    // 去 URL 里找名为 restaurantId 的路径变量， 把它的值取出来（此时是 "1"）转成 long赋给方法参数 restaurantId
    public List<MenuItemEntity> getMenuByRestaurant(@PathVariable("restaurantId") long restaurantId) {
        return menuItemService.getMenuItemsByRestaurantId(restaurantId);
    }


    @GetMapping("/restaurants/menu")
    public List<RestaurantDto> getMenuForAllRestaurants() {
        return restaurantService.getRestaurants();
    }
}
