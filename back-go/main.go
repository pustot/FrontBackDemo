package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"sync"
	"time"
)

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

func worker(id int) {
	fmt.Printf("Worker %d starting\n", id)
	time.Sleep(time.Second)
	fmt.Printf("Worker %d done\n", id)
}

func main() {
	var wg sync.WaitGroup

	type Sqler struct {
		Id string `json:"id"`
		Mc string `json:"mc"`
	}
	sqlers := []Sqler{
		{"2766", "hello from Go!!"},
		{"4F6F", "jang,ziang"},
		{"5134", "njang"},
	}

	res := make(map[string][]Sqler)
	res["data"] = sqlers

	r := gin.Default()
	r.Use(CORSMiddleware())
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, res)
	})
	r.GET("/hans", func(c *gin.Context) {

		// the example API function with concurrency
		for i := 1; i <= 5; i++ {
			wg.Add(1)
			i := i

			go func() {
				defer wg.Done()
				worker(i)
			}()
		}
		wg.Wait()

		c.JSON(http.StatusOK, res)
	})
	http.ListenAndServe(":5000", r)
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
