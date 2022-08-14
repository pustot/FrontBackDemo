package com.ycx.flsmtxjava.controller;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.io.Serializable;
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

    final int SLEEP_MS = 100;

    private class Reducer{
        private ReentrantLock lock;
        private int count;
        Reducer(int count) {
            this.count = count;
            lock = new ReentrantLock();
        }
    }

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    private static class Report implements Serializable {
        String msg;
        long backStartTime;
        long backEndTime;
        long lockTime;
        long unlockTime;
        long rLockTime;
        long rUnlockTime;
        Report(String msg, long backStartTime, long backEndTime,
                       long lockTime, long unlockTime, long rLockTime, long rUnlockTime) {
            this.msg = msg;
            this.backStartTime = backStartTime;
            this.backEndTime = backEndTime;
            this.lockTime = lockTime;
            this.unlockTime = unlockTime;
            this.rLockTime = rLockTime;
            this.rUnlockTime = rUnlockTime;
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
    public Report flashBuy(@Valid @PathVariable(value = "id") int id) {
        long backStartTime = System.nanoTime();
        if (id < 0 || id > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id exceeds limit");
        }

        String msg;
        long unlockStartTime, unlockEndTime;
        long lockStartTime = System.nanoTime();
        items.get(id).lock.lock();
        long lockEndTime = System.nanoTime();
        try {
            Thread.sleep(SLEEP_MS * 1); // simulate large list
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        try {
            int cnt = items.get(id).count;
            if (cnt > 0) {
                items.get(id).count --;
                msg = "Flash Buy Successful!";
            } else if (cnt == 0) {
                msg = "Flash Buy Failed.";
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Item Less Than Zero");
            }
        } finally {
            unlockStartTime = System.nanoTime();
            items.get(id).lock.unlock();
            unlockEndTime = System.nanoTime();
        }

        return new Report(msg, backStartTime, System.nanoTime(),
                lockEndTime - lockStartTime, unlockEndTime - unlockStartTime,
                0, 0);
    }
}
