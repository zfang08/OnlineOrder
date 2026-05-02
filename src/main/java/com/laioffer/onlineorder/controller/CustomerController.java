// first this piece of code is packaged under this directory.
package com.laioffer.onlineorder.controller;


import com.laioffer.onlineorder.model.RegisterBody;
import com.laioffer.onlineorder.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerController {

    // Dependency Injection
    private final CustomerService customerService;

    // constructor， 如果你需要一个customerController 必须给我我要的dependency
    // 也就是customer service 这个class， 你必须给我一个customer service 的class。

    // "哦，要创建 CustomerController，我得先有一个 CustomerService。"
    // "我仓库里正好有一个 CustomerService 实例，拿过来！"
    // "调用 new CustomerController(那个 CustomerService 实例)，搞定。"

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // 写操作。是关于post 的restful api
    @PostMapping("/signup")
    @ResponseStatus(value = HttpStatus.CREATED)// 一切都顺利， 我们返回的response 是什么。
    // 这里没有写就是写ok， 但是这里具体一点就是说创建成功了， 而不是光ok


    // signup 这个端口也需要sign in， 怎么样能够确认，我能够验证我们做的是对的
    public void signUp(@RequestBody RegisterBody body) {
        customerService.signUp(body.email(), body.password(), body.firstName(), body.lastName());
    }
}
