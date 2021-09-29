import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Todo = {
    id: number;
    text: string;
    checked: boolean;
};

export type Todos = Todo[];

export const {
    reducer: todos,
    actions: { addTodo, removeTodo, toggleTodo },
} = createSlice({
    name: 'todos',
    initialState: [] as Todos,
    reducers: {
        addTodo(state, { payload: newTodo }: PayloadAction<Todo>) {
            state.push({ ...newTodo, id: new Date().getTime() });
        },
        removeTodo(state, { payload: index }: PayloadAction<number>) {
            state.splice(index, 1);
        },
        toggleTodo(state, { payload: id }: PayloadAction<number>) {
            const todo = state.find((todo) => todo.id === id);
            if (todo) {
                todo.checked = !todo.checked;
            }
        },
    },
});

export const store = configureStore({
    reducer: {
        todos,
    },
});
