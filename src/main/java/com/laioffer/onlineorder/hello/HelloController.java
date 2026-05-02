package com.laioffer.onlineorder.hello;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// 需要写上这个来让spring boot 知道这个是一个controller
@RestController
public class HelloController {


    // 这个是我们要去的一个路径。
    @GetMapping("/hello")
    public Person sayHello(@RequestParam(required = false, defaultValue = "Guest") String name) {
        return new Person(
                name,
                "LaiOffer",
                new Address("123 Main St", "San Jose", "CA", "USA"),
                new Book("The Great Gatsby", "F. Scott Fitzgerald"));
    }
}
