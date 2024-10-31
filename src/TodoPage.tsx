import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useState } from "react";
import axios from "axios";

// API base URL - change this to your production URL when deploying
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

type Todo = {
    id: number;
    title: string;
    completed: boolean;
    created_at: string;
};

export default function TodoPage() {
    const [newTodo, setNewTodo] = useState("");
    const queryClient = useQueryClient();

    const { data: todos, isLoading, error } = useQuery<Todo[]>({
        queryKey: ["todos"],
        queryFn: async () => {
            const { data } = await api.get('/api/todos');
            return data;
        },
    });

    const addTodoMutation = useMutation({
        mutationFn: async (title: string) => {
            const { data } = await api.post('/api/todos', { title });
            return data;
        },
        onSuccess: () => {
            setNewTodo(""); // Clear input on success
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const toggleTodoMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
            const { data } = await api.patch(`/api/todos/${id}`, { completed });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const deleteTodoMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.delete(`/api/todos/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodo.trim()) {
            addTodoMutation.mutate(newTodo.trim());
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Todo List</CardTitle>
                    <CardDescription>Manage your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                        <Input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            placeholder="Add a new todo..."
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={addTodoMutation.isPending}>
                            Add
                        </Button>
                    </form>
                    <div className="space-y-2">
                        {todos?.map((todo) => (
                            <div
                                key={todo.id}
                                className="flex items-center justify-between border p-2 rounded"
                            >
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={todo.completed}
                                        onCheckedChange={(checked) =>
                                            toggleTodoMutation.mutate({
                                                id: todo.id,
                                                completed: checked as boolean,
                                            })
                                        }
                                    />
                                    <span className={todo.completed ? "line-through" : ""}>
                                        {todo.title}
                                    </span>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteTodoMutation.mutate(todo.id)}
                                    disabled={deleteTodoMutation.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-gray-500">
                        {todos?.length} {todos?.length === 1 ? "item" : "items"}
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
