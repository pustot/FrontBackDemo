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
        Item(String id, String name, int count) {
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
    public List<Item> getItems() {
        List<Item> res;

        readLock.lock();
        try {
            res = new ArrayList<>(items.values());
        } finally {
            readLock.unlock();
        }

        return res;
    }

    // Get a Single Item
    @GetMapping("/items/{id}")
    public Item getItemById(@Valid @PathVariable(value = "id") UUID itemId) {
        Item res;

        readLock.lock();
        try {
            res = items.getOrDefault(itemId, null);
        } finally {
            readLock.unlock();
        }

        if (res == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "entity not found"
            );
        }
        return res;
    }

    // Create a new Item
    @PostMapping("/items")
    public Item postItems(@Valid @RequestBody ItemWoID item) {
        UUID newId = UUID.randomUUID();
        Item newItem = new Item(newId.toString(), item.name, item.count);

        writeLock.lock();
        try {
            items.put(newId, newItem);
        } finally {
            writeLock.unlock();
        }

        return newItem;
    }

    // Update a Item
    @PutMapping("/items/{id}")
    public Item putItemByID(@Valid @PathVariable(value = "id") UUID itemId,
                           @Valid @RequestBody ItemWoID itemDetails) {

        readLock.lock();
        try {
            if (!items.containsKey(itemId))
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "entity not found"
                );
        } finally {
            readLock.unlock();
        }

        Item newItem = new Item(itemId.toString(), itemDetails.name, itemDetails.count);

        writeLock.lock();
        try {
            items.put(itemId, newItem);
        } finally {
            writeLock.unlock();
        }

        return newItem;
    }

    // Delete a Item
    @DeleteMapping("/items/{id}")
    public Item deleteItem(@Valid @PathVariable(value = "id") UUID itemId) {
        Item res;

        readLock.lock();
        try {
            if (!items.containsKey(itemId))
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "entity not found"
                );
        } finally {
            readLock.unlock();
        }

        writeLock.lock();
        try {
            res = items.remove(itemId);
        } finally {
            writeLock.unlock();
        }

        return res;
    }
}