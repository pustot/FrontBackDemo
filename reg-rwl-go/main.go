package main

// https://go.dev/doc/tutorial/create-module
import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type item struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Count int     `json:"count"`
	Price float64 `json:"price"`
}

type itemWoID struct {
	Name  string  `json:"name"`
	Count int     `json:"count"`
	Price float64 `json:"price"`
}

// https://stackoverflow.com/questions/15130321/is-there-a-method-to-generate-a-uuid-with-go-language
var exampleID = uuid.New()

// https://gobyexample.com/maps
var items = map[uuid.UUID]item{
	exampleID: {ID: exampleID.String(), Name: "example", Count: 2, Price: 9.15}}

func main() {
	id := uuid.New()
	fmt.Println(id.String())

	// https://go.dev/doc/tutorial/web-service-gin
	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/items", getItems)
	router.GET("/items/:id", getItemByID)
	router.POST("/items", postItems)
	router.PUT("/items/:id", putItemByID)
	router.DELETE("/items/:id", deleteItemByID)

	router.Run("localhost:8080") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}

// getItems responds with the list of all albums as JSON.
func getItems(c *gin.Context) {
	res := make([]item, 0, len(items))
	for _, val := range items {
		res = append(res, val)
	}
	// c.IndentedJSON(http.StatusOK, items)
	c.JSON(http.StatusOK, res)
}

// postItems adds an album from JSON received in the request body.
func postItems(c *gin.Context) {
	var rawItem itemWoID

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := c.BindJSON(&rawItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newId := uuid.New()
	newItem := item{ID: newId.String(), Name: rawItem.Name, Count: rawItem.Count, Price: rawItem.Price}

	// Add the new album to the slice.
	items[newId] = newItem
	c.JSON(http.StatusCreated, newId)
}

// getItemByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getItemByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Loop over the list of albums, looking for
	// an album whose ID value matches the parameter.
	if val, ok := items[id]; ok {
		c.JSON(http.StatusOK, val)
		return
	}

	c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
}

func putItemByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, ok := items[id]; !ok {
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

	newItem := item{ID: id.String(), Name: rawItem.Name, Count: rawItem.Count, Price: rawItem.Price}

	// Add the new album to the slice.
	items[id] = newItem
	c.JSON(http.StatusCreated, newItem)
}

func deleteItemByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, ok := items[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
		return
	}

	// Add the new album to the slice.
	res := items[id]
	delete(items, id)
	c.JSON(http.StatusOK, res)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
