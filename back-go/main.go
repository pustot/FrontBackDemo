package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
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

func main() {
	type Sqler struct {
		Columns []string   `json:"columns"`
		Values  [][]string `json:"values"`
	}
	sqler := Sqler{
		Columns: []string{"unicode", "mc"},
		Values: [][]string{
			{"2766", "hello from Go!!"},
			{"4F6F", "jang,ziang"},
			{"5134", "njang"},
		},
	}

	res := make(map[string][]Sqler)
	res["data"] = []Sqler{sqler}

	r := gin.Default()
	r.Use(CORSMiddleware())
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, res)
	})
	r.POST("/demo_search", func(c *gin.Context) {
		//c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.JSON(http.StatusOK, res)
	})
	http.ListenAndServe(":5000", r)
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
