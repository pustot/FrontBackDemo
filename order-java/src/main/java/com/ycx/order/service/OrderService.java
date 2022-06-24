package com.ycx.order.service;

import com.ycx.order.pojo.Stock;
import org.springframework.stereotype.Service;


public interface OrderService {


    /**
     * Empty order list
     */
    int delOrderDBBefore();

    /**
     * create order (with problem of over selling)
     *
     * @param sid
     * @return int
     */
    int createWrongOrder(int sid) throws Exception;

    /**
     * create order with optimistic lock to update the DB
     *
     * @param sid
     * @return int
     */
    int createOptimisticOrder(int sid) throws Exception;

    /**
     * update the stock DB, with Redis for DB read to reduce pressure
     *
     * @param sid
     * @return int
     */
    int createOrderWithLimitAndRedis(int sid) throws Exception;

    /**
     * Limit queue + Redis cache + Kafka async message
     *
     * @param sid
     */
    void createOrderWithLimitAndRedisAndKafka(int sid) throws Exception;

    /**
     * Kafka message consumer
     *
     * @param stock
     */
    int consumerTopicToCreateOrderWithKafka(Stock stock) throws Exception;
}
