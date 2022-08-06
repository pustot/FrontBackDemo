package main

// https://go.dev/doc/tutorial/create-module
import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"sync"
)

var NUM_OF_ITEMS int = 5
var MAX_OF_EACH_ITEM int = 20

type reducer struct {
	mtx   sync.Mutex
	count int
}

var items []reducer

func main() {
	// https://gobyexample.com/mutexes
	items = make([]reducer, 0, NUM_OF_ITEMS)
	for i := 0; i < NUM_OF_ITEMS; i++ {
		items = append(items, reducer{count: MAX_OF_EACH_ITEM})
	}

	// https://go.dev/doc/tutorial/web-service-gin
	router := gin.Default()
	router.Use(CORSMiddleware())
	// as said here: https://github.com/gin-gonic/gin/issues/1335
	// > that serves each request by an individual goroutine
	// so no need to write goroutine for each req explicitly
	router.GET("/api/items/:id", getItemByID)
	router.PUT("/api/items/:id", flashBuy)

	router.Run("localhost:8080") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}

//func sleep(msg string) {
//	fmt.Println("sleeping " + msg)
//	time.Sleep(1 * time.Second)
//}

// getItemByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getItemByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if id < 0 || id > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id exceeds limit"})
		return
	}

	// Loop over the list of albums, looking for
	// an album whose ID value matches the parameter.
	items[id].mtx.Lock()
	//sleep("getItemByID R")
	val := items[id].count
	items[id].mtx.Unlock()
	//sleep("getItemByID R Unlocked")
	c.JSON(http.StatusOK, val)
	return
}

func flashBuy(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if id < 0 || id > NUM_OF_ITEMS {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id exceeds limit"})
		return
	}

	items[id].mtx.Lock()
	defer items[id].mtx.Unlock()
	switch remaining := items[id].count; {
	case remaining > 0:
		items[id].count--
		c.JSON(http.StatusOK, "Flash Buy Successful!")
	case remaining == 0:
		c.JSON(http.StatusOK, "Flash Buy Failed.")
	default:
		c.JSON(http.StatusInternalServerError, "Item Less Than Zero")
	}
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
