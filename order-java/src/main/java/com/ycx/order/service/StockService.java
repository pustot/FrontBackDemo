package com.ycx.order.service;

import com.ycx.order.pojo.Stock;
import org.springframework.stereotype.Service;


public interface StockService {

    /**
     * get stock count by id
     * @param id
     * @return int
     */
    int getStockCount(int id);

    /**
     * get stock info by id
     * @param id
     * @return stock
     */
    Stock getStockById(int id);

    /**
     * update stock info by id
     * @param stock
     * @return int
     */
    int updateStockById(Stock stock);

    /**
     * update with optimistic lock to deal with over selling
     */
    int updateStockByOptimistic(Stock stock);

    /**
     * init DB
     */
    int initDBBefore();
}
