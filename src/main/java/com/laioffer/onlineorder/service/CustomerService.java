package com.laioffer.onlineorder.service;


import com.laioffer.onlineorder.entity.CartEntity;
import com.laioffer.onlineorder.entity.CustomerEntity;
import com.laioffer.onlineorder.repository.CartRepository;
import com.laioffer.onlineorder.repository.CustomerRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class CustomerService {


    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;  // 密码机
    private final UserDetailsManager userDetailsManager; // 人事管理员

    // Dependency injection
    public CustomerService(
            CartRepository cartRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            UserDetailsManager userDetailsManager) {
        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsManager = userDetailsManager;
    }

    // 注册函数： 首先transactional 就是说明， 其中如果失败就rollback， 否则才更新
    @Transactional
    public void signUp(String email, String password, String firstName, String lastName) {

        // 1. email 转成小写的
        email = email.toLowerCase();

        // 2. 创建一个user 实例， 然后加密他的password
        UserDetails user = User.builder()
                .username(email)
                .password(passwordEncoder.encode(password))
                .roles("USER")
                .build();

        // 3. 我们创建用户， 然后把额外的一些信息记录下来插入到table 当中/
        userDetailsManager.createUser(user);
        customerRepository.updateNameByEmail(email, firstName, lastName);

        // 4. 去找找看这个用户有没有创建好， 如果创建好了， 我们就create 一个空的购物车， 并且把这个cart insert 到我们的cart repository
        CustomerEntity savedCustomer = customerRepository.findByEmail(email);
        CartEntity cart = new CartEntity(null, savedCustomer.id(), 0.0);
        cartRepository.save(cart);
    }

    // 2. 这个方法是用来找
    public CustomerEntity getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
}
