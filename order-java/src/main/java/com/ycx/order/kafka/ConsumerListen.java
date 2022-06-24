package com.ycx.order.kafka;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ycx.order.pojo.Stock;
import com.ycx.order.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class ConsumerListen {

    private Gson gson = new GsonBuilder().create();

    @Autowired
    private OrderService orderService;

    @KafkaListener(topics = "ORDER-JAVA-TOPIC")
    public void listen(ConsumerRecord<String, String> record) throws Exception {
        Optional<?> kafkaMessage = Optional.ofNullable(record.value());
        // Object -> String
        String message = (String) kafkaMessage.get();
        // 反序列化
        Stock stock = gson.fromJson((String) message, Stock.class);
        // 创建订单
        orderService.consumerTopicToCreateOrderWithKafka(stock);
    }
}
