import './style.css';

import Tonic from '@optoolco/tonic';
import { addTodo, store, Todo, Todos, toggleTodo } from './store';

const wait = (timeout: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeout);
    });
};

const messages = {
    hi: 'Hello, world',
    bye: 'Goodbye, and thanks for all the fish',
};

class MyGreeting extends Tonic<{
    messages: typeof messages;
    display: string;
    fg: string;
    bg: string;
}> {
    styles() {
        return {
            a: {
                color: this.props.fg,
                fontSize: '2rem',
            },
            b: {
                backgroundColor: this.props.bg,
                padding: '1rem',
            },
        };
    }

    stylesheet() {
        return `
        my-greeting div {
          display: ${this.props.display};
          flex-direction: column;
        }
      `;
    }

    static stylesheet() {
        return `
          my-greeting div {
            border: 1px dotted #666;
          }
        `;
    }

    async *render() {
        yield this.html`<p>Loading...</p>`;

        await wait(3000);

        const res = await fetch('https://api.github.com/');
        const urls = await res.json();

        return this.html`
        <div styles="a b">
          <h1>${this.props.messages && this.props.messages.hi}</h1>
          <h2>${this.props.messages && this.props.messages.bye}</h2>
          <pre>
            ${JSON.stringify(urls, null, 2)}
          </pre>
        </div>
      `;
    }
}

class SomeComponent extends Tonic<{ a: string; b: number }> {
    render() {
        return this.html`
          <span>A: ${this.props.a}</span>
          <span>B: ${this.props.b}</span>
        `;
    }
}

class UpdatingProps extends Tonic<{ color: string; bar: string }> {
    constructor() {
        super();
        setTimeout(() => {
            this.reRender((props) => ({
                ...props,
                color: 'red',
            }));
        }, 1000);

        setTimeout(() => {
            this.reRender({
                color: 'blue',
            });
        }, 3000);

        setTimeout(() => {
            this.reRender();
        }, 6000);
    }
    render() {
        console.log('Render', this.props);
        return this.html`<button>Click Me</button>`;
    }
}

class StatefulComponent extends Tonic<void, { foo: string; color: string }> {
    constructor() {
        super();
        this.state = {
            foo: 'bar',
            color: 'red',
        };

        setTimeout(() => {
            this.state = {
                ...this.state,
                color: 'blue',
            };

            this.reRender();
        }, 3000);

        setTimeout(() => {
            this.state = {
                color: 'green',
            };

            this.reRender();
        }, 6000);
    }

    render() {
        const {
            state: { color, foo },
        } = this;
        return this.html`<span>Stateful ${color} | ${foo}</span>`;
    }
}

class MyPage extends Tonic {
    renderHeader() {
        return this.html`<h1>Header</h1>`;
    }

    render() {
        return this.html`
          ${this.renderHeader()}
          <main>My page</main>
        `;
    }
}

type User = {
    name: string;
};

class LoginPage extends Tonic<{ user?: User }> {
    render() {
        let message = 'Please Log in';

        if (this.props.user) {
            message = this.html`<div>Welcome ${this.props.user.name}</div>`;
        }

        return this.html`<div class="message">${message}</div>`;
    }
}

class ParentComponent extends Tonic {
    render() {
        return this.html`
          <div class="parent">${this.children}</div>
        `;
    }
}

class ChildComponent extends Tonic<{ value: string }> {
    render() {
        return this.html`
          <div class="child">
            ${this.props.value}
          </div>
        `;
    }
}

class TodoList extends Tonic<{ todos: Todos }> {
    constructor() {
        super();
        // this.props = { todos: [] };
    }

    get hasTodos() {
        const {
            props: { todos },
        } = this;

        return todos && todos.length >= 1;
    }

    submit(e: Event) {
        e.preventDefault();
        if (e.target instanceof HTMLFormElement) {
            const formData = new FormData(e.target);
            const maybeTodo = [...formData.entries()].reduce(
                (map, [key, value]) => ({ ...map, [key]: value }),
                { text: '', checked: false } as Todo
            );
            store.dispatch(addTodo(maybeTodo));
        }
    }

    click(e: Event) {
        if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
            const id = e.target.id;
            if (id && parseInt(id) !== NaN) {
                store.dispatch(toggleTodo(parseInt(id)));
            }
        }
    }

    render() {
        const {
            props: { todos },
        } = this;

        return this.html`
            <form>
                <input type="text" name="text" required minlength="2" autofocus autocomplete="off"/>
                <button>Add</button>
            </form>
            ${
                this.hasTodos
                    ? this.html`<ul>${todos?.map(
                          (todo) =>
                              this.html`<li><input type="checkbox" ...${todo}/>
                                ${
                                    todo.checked ? this.html`<s>${todo.text}</s>` : todo.text
                                }                                
                              </li>`
                      )}</ul>`
                    : this.html`<span>There is no TODOs...</span>`
            }
        `;
    }

    willConnect() {
        const updateTodos = () => {
            const { todos } = store.getState();

            this.reRender((props) => ({
                ...props,
                todos,
            }));
        };

        updateTodos();
        store.subscribe(updateTodos);
    }

    updated() {
        const input = this.querySelector('input');
        input && input instanceof HTMLInputElement && input.focus();
    }
}

class ChildElement extends Tonic {
    render() {
        return this.html`
      <span data-event="click-me" data-bar="true">Click Me</span>
    `;
    }
}

class ParentElement extends Tonic {
    click({ target }: Event) {
        if (target instanceof HTMLElement) {
            const el = Tonic.match(target, '[data-event]');

            if (el instanceof HTMLElement && el.dataset.event === 'click-me') {
                console.log('ParentElement.click', el.dataset.bar);
            }
        }
    }

    render() {
        return this.html`
          <child-element>
          </child-element>
        `;
    }
}

class MyApp extends Tonic {
    //
    // You can listen to any DOM event that happens in your component
    // by creating a method with the corresponding name. The method will
    // receive the plain old Javascript event object.
    //
    mouseover(e: Event) {
        console.log('mouseover', { e });
    }

    change(e: Event) {
        console.log('change', { e });
    }

    willConnect() {
        // The component will connect.
        console.log('willConnect');
    }

    connected() {
        // The component has rendered.
        console.log('connected');
    }

    disconnected() {
        // The component has disconnected.
        console.log('disconnected');
    }

    updated() {
        // The component has re-rendered.
        console.log('updated');
    }

    click(e: Event) {
        console.log('click', { e });
        //
        // You may want to check which element in the component was actually
        // clicked. You can also check the `e.path` attribute to see what was
        // clicked (helpful when handling clicks on top of SVGs).
        //
        if (e.target instanceof HTMLElement && !e.target.matches('.parent')) return;

        // ...
    }

    render() {
        const o = {
            a: 'testing',
            b: 2.2,
            fooBar: 'ok',
        };

        return this.html`
          <!-- <some-component ...${o}></some-component>
          <div ...${o}>
          </div>
          <updating-props></updating-props>
          <stateful-component id="anything"></stateful-component>
          <my-page></my-page>
          <login-page user=${{ name: 'Luciano' }}></login-page>
          <parent-component>
            <child-component value="hello world"></child-component>
          </parent-component> -->
          <todo-list id="my-todo-list"></todo-list>
          <!-- <parent-element></parent-element>
          <my-greeting messages="${messages}" display="flex"></my-greeting> -->
        `;
    }
}

Tonic.add(MyGreeting);
Tonic.add(MyApp);
Tonic.add(SomeComponent);
Tonic.add(UpdatingProps);
Tonic.add(StatefulComponent);
Tonic.add(MyPage);
Tonic.add(LoginPage);
Tonic.add(ParentComponent);
Tonic.add(ChildComponent);
Tonic.add(TodoList);
Tonic.add(ParentElement);
Tonic.add(ChildElement);
