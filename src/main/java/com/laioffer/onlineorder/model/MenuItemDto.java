package com.laioffer.onlineorder.model;
import com.laioffer.onlineorder.entity.MenuItemEntity;

// menuItemDto 其实就是用到了menuItemEntity, 但是就是不存restaurantID， 这个东西好像用户不需要知道。
public record MenuItemDto(
        Long id,
        String name,
        String description,
        Double price,
        String imageUrl
) {


    public MenuItemDto(MenuItemEntity entity) {
        this(
                entity.id(),
                entity.name(),
                entity.description(),
                entity.price(),
                entity.imageUrl()
        );
    }
}
