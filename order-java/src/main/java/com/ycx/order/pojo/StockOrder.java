package com.ycx.order.pojo;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class StockOrder {
    private Integer id;

    // stock id
    private Integer sid;

    private String name;

    private Date createTime;
}
