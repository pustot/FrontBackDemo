package com.ycx.regrwljava.controller;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import javax.validation.constraints.Null;
import java.io.Serializable;
import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin(origins = "*", allowedHeaders = "*")  // CORS
@RestController
@RequestMapping("/api")
public class ItemController {
    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    private static class Item implements Serializable {
        String id;
        String name;
        int count;
        Item(String id, String name, int count) {
            this.id = id;
            this.name = name;
            this.count = count;
        }
    }

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    private static class ItemWoID implements Serializable {
        public String name;
        public int count;

        ItemWoID(String name, int count) {
            this.name = name;
            this.count = count;
        }
    }

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    private static class ReportWithItem implements Serializable {
        Item item;
        long backStartTime;
        long backEndTime;
        long lockTime;
        long unlockTime;
        long rLockTime;
        long rUnlockTime;
        ReportWithItem(Item item, long backStartTime, long backEndTime,
                       long lockTime, long unlockTime, long rLockTime, long rUnlockTime) {
            this.item = item;
            this.backStartTime = backStartTime;
            this.backEndTime = backEndTime;
            this.lockTime = lockTime;
            this.unlockTime = unlockTime;
            this.rLockTime = rLockTime;
            this.rUnlockTime = rUnlockTime;
        }
    }

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
    private static class ReportWithItemList implements Serializable {
        List<Item> itemList;
        long backStartTime;
        long backEndTime;
        long lockTime;
        long unlockTime;
        long rLockTime;
        long rUnlockTime;
        ReportWithItemList(List<Item> itemList, long backStartTime , long backEndTime,
                           long lockTime, long unlockTime, long rLockTime, long rUnlockTime) {
            this.itemList = itemList;
            this.backStartTime = backStartTime;
            this.backEndTime = backEndTime;
            this.lockTime = lockTime;
            this.unlockTime = unlockTime;
            this.rLockTime = rLockTime;
            this.rUnlockTime = rUnlockTime;
        }
    }

    private final UUID exampleID = UUID.randomUUID();

    private Map<UUID, Item> items = Stream.of(
            new AbstractMap.SimpleEntry<>(exampleID, new Item(exampleID.toString(), "example", 2))
    ).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    private final ReadWriteLock readWriteLock
            = new ReentrantReadWriteLock();
    private final Lock writeLock
            = readWriteLock.writeLock();
    private final Lock readLock = readWriteLock.readLock();

    // Get All Items
    @GetMapping("/items")
    public ReportWithItemList getItems() {
        long backStartTime = System.nanoTime();

        List<Item> res;

        long rUnlockStartTime, rUnlockEndTime;

        long rLockStartTime = System.nanoTime();
        readLock.lock();
        long rLockEndTime = System.nanoTime();
        try {
            res = new ArrayList<>(items.values());
            Thread.sleep(1); // simulate large list
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            rUnlockStartTime = System.nanoTime();
            readLock.unlock();
            rUnlockEndTime = System.nanoTime();
        }

        return new ReportWithItemList(res, backStartTime, System.nanoTime(), 0, 0,
                rLockEndTime - rLockStartTime, rUnlockEndTime - rUnlockStartTime);
    }

    // Get a Single Item
    @GetMapping("/items/{id}")
    public ReportWithItem getItemById(@Valid @PathVariable(value = "id") UUID itemId) {
        long backStartTime = System.nanoTime();
        Item res;

        long rUnlockStartTime, rUnlockEndTime;
        long rLockStartTime = System.nanoTime();
        readLock.lock();
        long rLockEndTime = System.nanoTime();
        try {
            res = items.getOrDefault(itemId, null);
        } finally {
            rUnlockStartTime = System.nanoTime();
            readLock.unlock();
            rUnlockEndTime = System.nanoTime();
        }

        if (res == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "entity not found"
            );
        }
        return new ReportWithItem(res, backStartTime, System.nanoTime(), 0, 0,
                rLockEndTime - rLockStartTime, rUnlockEndTime - rUnlockStartTime);
    }

    // Create a new Item
    @PostMapping("/items")
    public ReportWithItem postItems(@Valid @RequestBody ItemWoID item) {
        long backStartTime = System.nanoTime();
        UUID newId = UUID.randomUUID();
        Item newItem = new Item(newId.toString(), item.name, item.count);

        long unlockStartTime, unlockEndTime;
        long lockStartTime = System.nanoTime();
        writeLock.lock();
        long lockEndTime = System.nanoTime();
        try {
            items.put(newId, newItem);
        } finally {
            unlockStartTime = System.nanoTime();
            writeLock.unlock();
            unlockEndTime = System.nanoTime();
        }

        return new ReportWithItem(newItem, backStartTime, System.nanoTime(),
                lockEndTime - lockStartTime, unlockEndTime - unlockStartTime,
                0, 0);
    }

    // Update a Item
    @PutMapping("/items/{id}")
    public ReportWithItem putItemByID(@Valid @PathVariable(value = "id") UUID itemId,
                           @Valid @RequestBody ItemWoID itemDetails) {
        long backStartTime = System.nanoTime();

        long rUnlockStartTime, rUnlockEndTime;
        long rLockStartTime = System.nanoTime();
        readLock.lock();
        long rLockEndTime = System.nanoTime();
        try {
            if (!items.containsKey(itemId))
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "entity not found"
                );
        } finally {
            rUnlockStartTime = System.nanoTime();
            readLock.unlock();
            rUnlockEndTime = System.nanoTime();
        }

        Item newItem = new Item(itemId.toString(), itemDetails.name, itemDetails.count);

        long unlockStartTime, unlockEndTime;
        long lockStartTime = System.nanoTime();
        writeLock.lock();
        long lockEndTime = System.nanoTime();
        try {
            items.put(itemId, newItem);
        } finally {
            unlockStartTime = System.nanoTime();
            writeLock.unlock();
            unlockEndTime = System.nanoTime();
        }

        return new ReportWithItem(newItem, backStartTime, System.nanoTime(),
                lockEndTime - lockStartTime, unlockEndTime - unlockStartTime,
                rLockEndTime - rLockStartTime, rUnlockEndTime - rUnlockStartTime);
    }

    // Delete a Item
    @DeleteMapping("/items/{id}")
    public ReportWithItem deleteItem(@Valid @PathVariable(value = "id") UUID itemId) {
        long backStartTime = System.nanoTime();
        Item res;

        long rUnlockStartTime, rUnlockEndTime;
        long rLockStartTime = System.nanoTime();
        readLock.lock();
        long rLockEndTime = System.nanoTime();
        try {
            if (!items.containsKey(itemId))
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "entity not found"
                );
        } finally {
            rUnlockStartTime = System.nanoTime();
            readLock.unlock();
            rUnlockEndTime = System.nanoTime();
        }

        long unlockStartTime, unlockEndTime;
        long lockStartTime = System.nanoTime();
        writeLock.lock();
        long lockEndTime = System.nanoTime();
        try {
            res = items.remove(itemId);
        } finally {
            unlockStartTime = System.nanoTime();
            writeLock.unlock();
            unlockEndTime = System.nanoTime();
        }

        return new ReportWithItem(res, backStartTime, System.nanoTime(),
                lockEndTime - lockStartTime, unlockEndTime - unlockStartTime,
                rLockEndTime - rLockStartTime, rUnlockEndTime - rUnlockStartTime);
    }
}