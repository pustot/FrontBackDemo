package com.ycx.order.dao;

import com.ycx.order.pojo.StockOrder;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper()
public interface StockOrderMapper {

    @Insert("INSERT INTO stock_order (id, sid, name, create_time) VALUES " +
            "(#{id, jdbcType = INTEGER}, #{sid, jdbcType = INTEGER}, #{name, jdbcType = VARCHAR}, #{createTime, jdbcType = TIMESTAMP})")
    int insertSelective(StockOrder order);

    /**
     * Empty order list
     * 0 for success, -1 for failure
     */
    @Update("TRUNCATE TABLE stock_order")
    int delOrderDBBefore();
}
