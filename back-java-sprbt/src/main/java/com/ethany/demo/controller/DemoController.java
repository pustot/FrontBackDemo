package com.ethany.demo.controller;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.*;
import java.util.concurrent.TimeUnit;
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

    public static class Worker extends Thread {
        private final String workerName;

        public Worker(String workerName) {
            this.workerName = workerName;
        }

        @Override
        public void run() {
            System.out.println("Worker " + this.workerName + " starting");
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                System.out.println("e = " + e.getMessage());
            }
            System.out.println("Worker " + this.workerName + " done");
        }
    }

    List<Sqler> output = Arrays.asList(
            new Sqler("2764", "hello from Spring Boot"),
            new Sqler("4F6F", "jang,ziang"),
            new Sqler("5134", "njang"));

    @RequestMapping(value = "/hans", method = RequestMethod.GET)
    public Map<String, List<Sqler>> demoSearch() {
        List<Worker> workers = new ArrayList<>();

        for (int i = 1; i <= 5; i ++) {
            workers.add(new Worker("" + i));
        }
        for (Worker w : workers) {
            w.start();
        }
        for (Worker w : workers) {
            try {
                w.join();
            } catch (InterruptedException e) {
                System.out.println("e = " + e.getMessage());
            }
        }


        Map<String, List<Sqler>> res = new HashMap<>();
        res.put("data", output);
        return res;
    }
}