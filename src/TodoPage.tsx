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

// API base URL - change this to your production URL when deploying
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

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
            const response = await fetch(`${API_BASE}/api/todos`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data;
        },
    });

    const addTodoMutation = useMutation({
        mutationFn: async (title: string) => {
            const response = await fetch(`${API_BASE}/api/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) {
                throw new Error("Failed to add todo");
            }
            return response.json();
        },
        onSuccess: () => {
            setNewTodo(""); // Clear input on success
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const toggleTodoMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
            const response = await fetch(`${API_BASE}/api/todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed }),
            });
            if (!response.ok) {
                throw new Error("Failed to update todo");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const deleteTodoMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${API_BASE}/api/todos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error("Failed to delete todo");
            }
            return response.json();
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
