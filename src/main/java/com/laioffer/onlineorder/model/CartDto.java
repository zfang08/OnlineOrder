package com.laioffer.onlineorder.model;
import com.laioffer.onlineorder.entity.CartEntity;


import java.util.List;

// 就是cartDto 就用到cart 的entity， 和我们已经创建好的orderItems然后存到list， 就给我们
public record CartDto(
        Long id,
        Double totalPrice,
        List<OrderItemDto> orderItems
) {
    public CartDto(CartEntity entity, List<OrderItemDto> orderItems) {
        this(
                entity.id(),
                entity.totalPrice(),
                orderItems
        );
    }
}
