package com.laioffer.onlineorder.controller;

import com.laioffer.onlineorder.entity.CustomerEntity;
import com.laioffer.onlineorder.model.AddToCartBody;
import com.laioffer.onlineorder.model.CartDto;
import com.laioffer.onlineorder.service.CartService;
import com.laioffer.onlineorder.service.CustomerService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;


@RestController
public class CartController {

    private final CartService cartService;
    private final CustomerService customerService;

    public CartController(
            CartService cartService,
            CustomerService customerService
    ) {
        this.cartService = cartService;
        this.customerService = customerService;
    }

    // 到cart 这个地址，就返回 cart

    // 写数据， 这里我希望用户给我发一个json， 然后这个json 我用AddToCartBody 这个class 接住，
    // 接住后用点操作来找到我要的data， 传输给后端。

    //  request body 请求应该长成这样 POST http://localhost:8080/cart{"menu_id":1}


    // 为什么不用pathVariable或者RequestParam， 因为一般去POST写操作一般都是用json， 用body 封装好。这样就不会写在url里面的
    // 所以不会泄露。 比如账号密码不会写在url 上面。

    @GetMapping("/cart")
    // 当你写了这个@authenticationpricipal  这个注释之后 spring boot 就会把已经登录的user 放到那里
    public CartDto getCart(@AuthenticationPrincipal User user) {
        CustomerEntity customer = customerService.getCustomerByEmail(user.getUsername());
        return cartService.getCart(customer.id());
    }

    @PostMapping("/cart")
    public void addToCart(@AuthenticationPrincipal User user, @RequestBody AddToCartBody body) {
        CustomerEntity customer = customerService.getCustomerByEmail(user.getUsername());
        cartService.addMenuItemToCart(customer.id(), body.menuId());
    }

    @PostMapping("/cart/checkout")
    public void checkout(@AuthenticationPrincipal User user) {
        CustomerEntity customer = customerService.getCustomerByEmail(user.getUsername());
        cartService.clearCart(customer.id());
    }
}

