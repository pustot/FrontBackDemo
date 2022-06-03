package com.ethany.demo.controller;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Stream;


@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
public class DemoController {

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    public class Sqler implements Serializable {
        private List<String> columns;
        private List<List<String>> values;

        Sqler(List<String> cl, List<List<String>> val) {
            columns = cl;
            values = val;
        }
    }

    Sqler asql = new Sqler(Arrays.asList("unicode", "mc"), Arrays.asList(
            Arrays.asList("2764", "hello from Spring Boot"),
            Arrays.asList("4F6F", "jang,ziang"),
            Arrays.asList("5134", "njang")
    ));

    List<Sqler> output = Arrays.asList(asql);

    @RequestMapping(value = "/demo_search", method = RequestMethod.POST)
    public Map<String, List<Sqler>> demoSearch() {
        Map<String, List<Sqler>> res = new HashMap<>();
        res.put("data", output);
        return res;
    }
}