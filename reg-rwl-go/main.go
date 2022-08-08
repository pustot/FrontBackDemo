package main

// https://go.dev/doc/tutorial/create-module
import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"sync"
	"time"
)

type item struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Count int    `json:"count"`
	//Price float64 `json:"price"`
}

type itemWoID struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
	//Price float64 `json:"price"`
}

type ReportWithItem struct {
	Item          item  `json:"item"`
	BackStartTime int64 `json:"backStartTime"`
	BackEndTime   int64 `json:"backEndTime"`
	LockTime      int64 `json:"lockTime"`
	UnlockTime    int64 `json:"unlockTime"`
	RLockTime     int64 `json:"rLockTime"`
	RUnlockTime   int64 `json:"rUnlockTime"`
}

type ReportWithItemList struct {
	ItemList      []item `json:"itemList"`
	BackStartTime int64  `json:"backStartTime"`
	BackEndTime   int64  `json:"backEndTime"`
	LockTime      int64  `json:"lockTime"`
	UnlockTime    int64  `json:"unlockTime"`
	RLockTime     int64  `json:"rLockTime"`
	RUnlockTime   int64  `json:"rUnlockTime"`
}

// https://stackoverflow.com/questions/15130321/is-there-a-method-to-generate-a-uuid-with-go-language
var exampleID = uuid.New()

// https://gobyexample.com/maps
var items = map[uuid.UUID]item{
	exampleID: {ID: exampleID.String(), Name: "example", Count: 2}} //, Price: 9.15

var m sync.RWMutex

func main() {
	id := uuid.New()
	fmt.Println(id.String())

	// https://go.dev/doc/tutorial/web-service-gin
	router := gin.Default()
	router.Use(CORSMiddleware())
	// as said here: https://github.com/gin-gonic/gin/issues/1335
	// > that serves each request by an individual goroutine
	// so no need to write goroutine for each req explicitly
	router.GET("/api/items", getItems)
	router.GET("/api/items/:id", getItemByID)
	router.POST("/api/items", postItems)
	router.PUT("/api/items/:id", putItemByID)
	router.DELETE("/api/items/:id", deleteItemByID)

	router.Run("localhost:8080") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}

//func sleep(msg string) {
//	fmt.Println("sleeping " + msg)
//	time.Sleep(1 * time.Second)
//}

// getItems responds with the list of all albums as JSON.
func getItems(c *gin.Context) {
	backStartTime := time.Now().UnixNano()
	rLockStartTime := time.Now().UnixNano()
	m.RLock()
	rLockEndTime := time.Now().UnixNano()
	//sleep("getItems R")
	res := make([]item, 0, len(items))
	for _, val := range items {
		res = append(res, val)
	}
	time.Sleep(1 * time.Nanosecond) // simulate large list
	rUnlockStartTime := time.Now().UnixNano()
	m.RUnlock()
	rUnlockEndTime := time.Now().UnixNano()
	//sleep("getItems R Unlocked")
	// c.IndentedJSON(http.StatusOK, items)
	c.JSON(http.StatusOK, ReportWithItemList{
		ItemList: res, BackStartTime: backStartTime, BackEndTime: time.Now().UnixNano(),
		RLockTime: rLockEndTime - rLockStartTime, RUnlockTime: rUnlockEndTime - rUnlockStartTime,
	})
}

// getItemByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getItemByID(c *gin.Context) {
	backStartTime := time.Now()
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Loop over the list of albums, looking for
	// an album whose ID value matches the parameter.
	rLockStartTime := int64(time.Since(backStartTime))
	m.RLock()
	rLockEndTime := int64(time.Since(backStartTime))
	//sleep("getItemByID R")
	val, ok := items[id]
	rUnlockStartTime := int64(time.Since(backStartTime))
	m.RUnlock()
	rUnlockEndTime := int64(time.Since(backStartTime))
	//sleep("getItemByID R Unlocked")
	if ok {
		c.JSON(http.StatusOK, ReportWithItem{
			Item: val, BackStartTime: 0, BackEndTime: int64(time.Since(backStartTime)),
			RLockTime: rLockEndTime - rLockStartTime, RUnlockTime: rUnlockEndTime - rUnlockStartTime,
		})
		return
	}

	c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
}

// postItems adds an album from JSON received in the request body.
func postItems(c *gin.Context) {
	backStartTime := time.Now()
	var rawItem itemWoID

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := c.BindJSON(&rawItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newId := uuid.New()
	newItem := item{ID: newId.String(), Name: rawItem.Name, Count: rawItem.Count} // , Price: rawItem.Price

	// Add the new album to the slice.
	lockStartTime := int64(time.Since(backStartTime))
	m.Lock()
	lockEndTime := int64(time.Since(backStartTime))
	//sleep("postItems W")
	items[newId] = newItem
	unlockStartTime := int64(time.Since(backStartTime))
	m.Unlock()
	unlockEndTime := int64(time.Since(backStartTime))
	//sleep("postItems W Unlocked")
	c.JSON(http.StatusCreated, ReportWithItem{
		Item: newItem, BackStartTime: 0, BackEndTime: int64(time.Since(backStartTime)),
		LockTime: lockEndTime - lockStartTime, UnlockTime: unlockEndTime - unlockStartTime,
	})
}

func putItemByID(c *gin.Context) {
	backStartTime := time.Now()
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rLockStartTime := int64(time.Since(backStartTime))
	m.RLock()
	rLockEndTime := int64(time.Since(backStartTime))
	//sleep("putItemByID R")
	_, ok := items[id]
	rUnlockStartTime := int64(time.Since(backStartTime))
	m.RUnlock()
	rUnlockEndTime := int64(time.Since(backStartTime))
	//sleep("putItemByID R Unlocked")
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
		return
	}

	var rawItem itemWoID

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := c.BindJSON(&rawItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newItem := item{ID: id.String(), Name: rawItem.Name, Count: rawItem.Count} // , Price: rawItem.Price

	// Add the new album to the slice.
	lockStartTime := int64(time.Since(backStartTime))
	m.Lock()
	lockEndTime := int64(time.Since(backStartTime))
	//sleep("putItemByID W")
	items[id] = newItem
	unlockStartTime := int64(time.Since(backStartTime))
	m.Unlock()
	unlockEndTime := int64(time.Since(backStartTime))
	//sleep("putItemByID W Unlocked")
	c.JSON(http.StatusCreated, ReportWithItem{
		Item: newItem, BackStartTime: 0, BackEndTime: int64(time.Since(backStartTime)),
		LockTime: lockEndTime - lockStartTime, UnlockTime: unlockEndTime - unlockStartTime,
		RLockTime: rLockEndTime - rLockStartTime, RUnlockTime: rUnlockEndTime - rUnlockStartTime,
	})
}

func deleteItemByID(c *gin.Context) {
	backStartTime := time.Now()
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rLockStartTime := int64(time.Since(backStartTime))
	m.RLock()
	rLockEndTime := int64(time.Since(backStartTime))
	//sleep("deleteItemByID R")
	res, ok := items[id]
	rUnlockStartTime := int64(time.Since(backStartTime))
	m.RUnlock()
	rUnlockEndTime := int64(time.Since(backStartTime))
	//sleep("deleteItemByID R Unlocked")
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
		return
	}

	// Add the new album to the slice.
	lockStartTime := int64(time.Since(backStartTime))
	m.Lock()
	lockEndTime := int64(time.Since(backStartTime))
	//sleep("deleteItemByID W")
	delete(items, id)
	unlockStartTime := int64(time.Since(backStartTime))
	m.Unlock()
	unlockEndTime := int64(time.Since(backStartTime))
	//sleep("deleteItemByID W Unlocked")
	c.JSON(http.StatusOK, ReportWithItem{
		Item: res, BackStartTime: 0, BackEndTime: int64(time.Since(backStartTime)),
		LockTime: lockEndTime - lockStartTime, UnlockTime: unlockEndTime - unlockStartTime,
		RLockTime: rLockEndTime - rLockStartTime, RUnlockTime: rUnlockEndTime - rUnlockStartTime,
	})
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
