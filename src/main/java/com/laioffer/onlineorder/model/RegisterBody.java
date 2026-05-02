package com.laioffer.onlineorder.model;


// 这个里面是用户请求的一个json body， 可以用在我们的controller里面
public record RegisterBody(
        String email,
        String password,
        String firstName,
        String lastName
) {
}
