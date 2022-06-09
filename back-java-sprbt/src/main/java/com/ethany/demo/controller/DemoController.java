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
        private String id;
        private String mc;

        Sqler(String id, String mc) {
            this.id = id;
            this.mc = mc;
        }
    }

    List<Sqler> output = Arrays.asList(
            new Sqler("2764", "hello from Spring Boot"),
            new Sqler("4F6F", "jang,ziang"),
            new Sqler("5134", "njang"));

    @RequestMapping(value = "/hans", method = RequestMethod.GET)
    public Map<String, List<Sqler>> demoSearch() {
        Map<String, List<Sqler>> res = new HashMap<>();
        res.put("data", output);
        return res;
    }
}