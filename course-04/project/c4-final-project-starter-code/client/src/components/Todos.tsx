import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
    Button,
    Checkbox,
    Divider,
    Grid,
    Header,
    Icon,
    Input,
    Image,
    Loader,
    Popup
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, putTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
    auth: Auth
    history: History
}

interface Page {
    current: string | null,
    next: string | null
}

interface TodosState {
    order: string
    orderDesc: string
    todos: Todo[]
    newTodoName: string
    loadingTodos: boolean,
    pageHistory: Page[]
}


export class Todos extends React.PureComponent<TodosProps, TodosState> {
    state: TodosState = {
        order: 'desc',
        orderDesc: 'Sort Ascending',
        todos: [],
        newTodoName: '',
        loadingTodos: true,
        pageHistory: []
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newTodoName: event.target.value })
    }

    onEditButtonClick = (todoId: string) => {
        this.props.history.push(`/todos/${todoId}/edit`)
    }

    onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
        try {
            const todoItem = {
                name: this.state.newTodoName.trim(),
                dueDate: this.calculateDueDate()
            };

            const newTodo = await createTodo(this.props.auth.getIdToken(), todoItem);
            this.setState({
                todos: [...this.state.todos, newTodo],
                newTodoName: ''
            })
        } catch(err) {
            if (err instanceof Error) {
                alert(`Failed to create todo: ${err.message}`)
                return;
            }
            alert('Unknown error');
        }
    }

    onTodoDelete = async (todoId: string) => {
        try {
            await deleteTodo(this.props.auth.getIdToken(), todoId)
            this.setState({
                todos: this.state.todos.filter(todo => todo.todoId !== todoId)
            })
        } catch {
            alert('Todo deletion failed')
        }
    }

    onTodoCheck = async (pos: number) => {
        try {
            const todo = this.state.todos[pos]
            await putTodo(this.props.auth.getIdToken(), todo.todoId, {
                name: todo.name,
                dueDate: todo.dueDate,
                done: !todo.done
            })
            this.setState({
                todos: update(this.state.todos, {
                    [pos]: { done: { $set: !todo.done } }
                })
            })
        } catch {
            alert('Todo deletion failed')
        }
    }

    renderSortIcon = () => {
        this.setState({
            orderDesc: this.state.order === 'asc' ? 'Sort Descending' : 'Sort Ascending'
        })
        return <Icon link name={this.state.order === 'asc' ? 'angle down' : 'angle up'} />
    }

    async componentDidMount() {
        try {
            const response = await getTodos(this.props.auth.getIdToken(), this.state.order, null);
            this.setState({
                todos: response.items,
                loadingTodos: false,
                pageHistory: [
                    {
                        current: null,
                        next: response.lastKey   
                    }
                ]
            })
        } catch (e) {
            if (e instanceof Error) {
                alert(`Failed to fetch todos: ${e.message}`)
                return;
            }
            alert('Unknown error');
        }
    }

    updateSortOrder = async () => {
        this.setState({ loadingTodos: true });
        try {
            const newOrder = this.state.order === 'asc' ? 'desc' : 'asc';
            const response = await getTodos(this.props.auth.getIdToken(), newOrder, null);
            
            this.setState({
                order: newOrder,
                todos: response.items,
                pageHistory: [
                    {
                        current: null,
                        next: response.lastKey
                    }
                ]
            });
        } catch (e) {
            if (e instanceof Error) {
                alert(`Sorting failred: ${e.message}`)
                return;
            }
            alert('Unknown error');
        } finally {
            this.setState({ loadingTodos: false });
        }

    }

    async pageTodos(forward = false) {
        this.setState({ loadingTodos: true });
        try {
            const currentPageHistory = [...this.state.pageHistory];
            
            if (!forward) {
                currentPageHistory.pop();
            }

            const page = currentPageHistory[currentPageHistory.length -1];
            const newCurrent = forward ? page.next : page.current;
            const response = await getTodos(this.props.auth.getIdToken(), this.state.order, newCurrent);
            
            if (forward) {
                currentPageHistory.push({ current: newCurrent, next: response.lastKey });
            }

            this.setState({
                todos: response.items,
                loadingTodos: false,
                pageHistory: [...currentPageHistory]
            })
        } catch (e) {
            if (e instanceof Error) {
                alert(`Failed to fetch todos: ${e.message}`)
                return;
            }
            alert('Unknown error');
        }
    }

    render() {
        return (
            <div>
                <Header as="h1">TODOs</Header>
                {this.renderCreateTodoInput()}
                {this.renderTodos()}
            </div>
        )
    }

    renderCreateTodoInput() {
        return (
            <Grid.Row>
                <Grid.Column width={16}>
                    <Input
                        action={{
                            color: 'teal',
                            labelPosition: 'left',
                            icon: 'add',
                            content: 'New task',
                            onClick: this.onTodoCreate
                        }}
                        fluid
                        actionPosition="left"
                        placeholder="To change the world..."
                        onChange={this.handleNameChange}
                    />
                </Grid.Column>
                <Grid.Column width={16}>
                    <Divider />
                </Grid.Column>
            </Grid.Row>
        )
    }

    renderTodos() {
        if (this.state.loadingTodos) {
            return this.renderLoading()
        }

        return this.renderTodosList()
    }

    renderLoading() {
        return (
            <Grid.Row>
                <Loader indeterminate active inline="centered">
                    Loading TODOs
                </Loader>
            </Grid.Row>
        )
    }

    renderGridHeader() {
        return (
            <Grid.Row>
                <Grid.Column width={1}></Grid.Column>
                <Grid.Column width={10}>
                    <strong>Name</strong>
                </Grid.Column>
                <Grid.Column width={3} onClick={() => this.updateSortOrder()}>
                    <strong>Due Date</strong>
                    <Popup trigger={this.renderSortIcon()}>
                        {this.state.orderDesc}
                    </Popup>
                </Grid.Column>
                <Grid.Column width={1}></Grid.Column>
                <Grid.Column width={1}></Grid.Column>
                <Grid.Column width={16}>
                    <Divider />
                </Grid.Column>
            </Grid.Row>)
    }

    renderGridFooter() {
        return (
            <Grid.Row>
                <Grid.Column width={4}></Grid.Column>
                <Grid.Column width={8} verticalAlign="middle" textAlign="center">
                    { this.state.pageHistory.length > 1 && <Button color="blue" onClick={() => this.pageTodos(false)}>Previous</Button> }
                    { !!this.state.pageHistory[this.state.pageHistory.length -1]?.next && <Button color="blue" onClick={() => this.pageTodos(true)}>Next</Button> }
                </Grid.Column>
                <Grid.Column width={4}></Grid.Column>
            </Grid.Row>
        );
    }

    renderTodosList() {
        return (
            <Grid padded>
                {this.renderGridHeader()}
                {this.state.todos.map((todo, pos) => {
                    return (
                        <Grid.Row key={todo.todoId}>
                            <Grid.Column width={1} verticalAlign="middle">
                                <Checkbox
                                    onChange={() => this.onTodoCheck(pos)}
                                    checked={todo.done}
                                />
                            </Grid.Column>
                            <Grid.Column width={10} verticalAlign="middle">
                                {todo.name}
                            </Grid.Column>
                            <Grid.Column width={3} floated="right">
                                {todo.dueDate}
                            </Grid.Column>
                            <Grid.Column width={1} floated="right">
                                <Button
                                    icon
                                    color="blue"
                                    onClick={() => this.onEditButtonClick(todo.todoId)}
                                >
                                    <Icon name="pencil" />
                                </Button>
                            </Grid.Column>
                            <Grid.Column width={1} floated="right">
                                <Button
                                    icon
                                    color="red"
                                    onClick={() => this.onTodoDelete(todo.todoId)}
                                >
                                    <Icon name="delete" />
                                </Button>
                            </Grid.Column>
                            {todo.attachmentUrl && (
                                <Image src={todo.attachmentUrl} size="small" wrapped />
                            )}
                            <Grid.Column width={16}>
                                <Divider />
                            </Grid.Column>
                        </Grid.Row>
                    )
                })}
                {this.renderGridFooter()}
            </Grid>
        )
    }

    calculateDueDate(): string {
        const date = new Date()
        date.setDate(date.getDate() + 7)

        return dateFormat(date, 'yyyy-mm-dd') as string
    }
}
