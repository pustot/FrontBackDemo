package com.ycx.item.repository;

import com.ycx.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


// save(), findOne(), findAll(), count(), delete() etc.
// https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/support/SimpleJpaRepository.html
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
}
