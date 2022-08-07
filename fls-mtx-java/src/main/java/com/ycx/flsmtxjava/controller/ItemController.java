package com.ycx.flsmtxjava.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@CrossOrigin(origins = "*", allowedHeaders = "*")  // CORS
@RestController
@RequestMapping("/api")
public class ItemController {
    final int NUM_OF_ITEMS = 5;
    final int MAX_OF_EACH_ITEM = 20;

    private class Reducer{
        private ReentrantLock lock;
        private int count;
        Reducer(int count) {
            this.count = count;
            lock = new ReentrantLock();
        }
    }

    List<Reducer> items = IntStream.range(0, NUM_OF_ITEMS)
            .mapToObj(x -> new Reducer(MAX_OF_EACH_ITEM))
            .collect(Collectors.toList());

    @GetMapping("/items/{id}")
    public int getItemById(@Valid @PathVariable(value = "id") int id) {
        if (id < 0 || id > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id exceeds limit");
        }

        items.get(id).lock.lock();
        try {
            return items.get(id).count;
        } finally {
            items.get(id).lock.unlock();
        }
    }

    @PutMapping("/items/{id}")
    public String flashBuy(@Valid @PathVariable(value = "id") int id) {
        if (id < 0 || id > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id exceeds limit");
        }

        items.get(id).lock.lock();
        try {
            int cnt = items.get(id).count;
            if (cnt > 0) {
                items.get(id).count --;
                return "Flash Buy Successful!";
            } else if (cnt == 0) {
                return "Flash Buy Failed.";
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Item Less Than Zero");
            }
        } finally {
            items.get(id).lock.unlock();
        }
    }
}
