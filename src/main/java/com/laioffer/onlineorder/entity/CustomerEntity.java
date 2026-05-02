package com.laioffer.onlineorder.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

// 告诉spring boot 这个class 就是连接到 databse的customer table的
@Table("customers")
public record CustomerEntity(
    @Id Long id,
    String email,
    String password,
    boolean enabled,
    String firstName,
    String lastName
) {
}
