package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"github.com/rs/cors"
)

type Todo struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

var todos []Todo
var mutex = &sync.Mutex{}
var idCounter int

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", ToDoListHandler)

	corsWrapper := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "PUT", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := corsWrapper.Handler(mux)
	http.ListenAndServe(":8080", handler)
}

func ToDoListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		mutex.Lock()
		json.NewEncoder(w).Encode(todos)
		mutex.Unlock()

	case "POST":
		var newTodo Todo
		err := json.NewDecoder(r.Body).Decode(&newTodo)
		if err != nil || newTodo.Title == "" || newTodo.Description == "" {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}
		newTodo.ID = strconv.Itoa(idCounter)
		idCounter++
		mutex.Lock()
		todos = append(todos, newTodo)
		mutex.Unlock()
		json.NewEncoder(w).Encode(newTodo)

	case "DELETE":
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing ID", http.StatusBadRequest)
			return
		}
		mutex.Lock()
		for i, todo := range todos {
			if todo.ID == id {
				todos = append(todos[:i], todos[i+1:]...)
				break
			}
		}
		mutex.Unlock()

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
