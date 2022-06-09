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
		//c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.JSON(http.StatusOK, res)
	})
	http.ListenAndServe(":5000", r)
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
