package com.ycx.item.controller;

import com.ycx.item.entity.Item;
import com.ycx.item.exception.ResourceNotFoundException;
import com.ycx.item.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")  // CORS
@RestController
@RequestMapping("/api")
public class ItemController {

    @Autowired
    ItemRepository itemRepository;

    private final TaskExecutor taskExecutor;

    public ItemController(final TaskExecutor taskExecutor) {
        this.taskExecutor = taskExecutor;
    }

    // Get All Items
    @GetMapping("/items")
    public List<Item> getAllItems() {

        taskExecutor.execute(() -> {
            System.out.println("get all");
            try {
                Thread.sleep(6000);
            } catch (InterruptedException e) {
                System.out.println(e.toString());
            }
            System.out.println("get all");
        });

        return itemRepository.findAll();
    }

    // Create a new Item
    @PostMapping("/items")
    public Item createItem(@Valid @RequestBody Item item) {

        taskExecutor.execute(() -> {
            System.out.println("post " + item.getId());
            try {
                Thread.sleep(6000);
            } catch (InterruptedException e) {
                System.out.println(e.toString());
            }
            System.out.println("post " + item.getId());
        });

        return itemRepository.save(item);
    }

    // Get a Single Item
    @GetMapping("/items/{id}")
    public Item getItemById(@PathVariable(value = "id") Long itemId) {

        taskExecutor.execute(() -> {
            System.out.println("get " + itemId);
            try {
                Thread.sleep(6000);
            } catch (InterruptedException e) {
                System.out.println(e.toString());
            }
            System.out.println("get " + itemId);
        });

        return itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
    }

    // Update a Item
    @PutMapping("/items/{id}")
    public Item updateItem(@PathVariable(value = "id") Long itemId,
                           @Valid @RequestBody Item itemDetails) {

        taskExecutor.execute(() -> {
            System.out.println("put " + itemId);
            try {
                Thread.sleep(6000);
            } catch (InterruptedException e) {
                System.out.println(e.toString());
            }
            System.out.println("put " + itemId);
        });

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", itemId));

        item.setName(itemDetails.getName());
        item.setCount(itemDetails.getCount());

        Item updatedItem = itemRepository.save(item);
        return updatedItem;
    }

    // Delete a Item
    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable(value = "id") Long itemId) {

        taskExecutor.execute(() -> {
            System.out.println("delete " + itemId);
            try {
                Thread.sleep(6000);
            } catch (InterruptedException e) {
                System.out.println(e.toString());
            }
            System.out.println("delete " + itemId);
        });

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", itemId));

        itemRepository.delete(item);

        return ResponseEntity.ok().build();
    }
}
