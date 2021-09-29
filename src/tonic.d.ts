type TemplateResult = string;

type Constructor<T> = new (...args: any[]) => T;

type PropsOrPropsFunction<TProps> = Partial<TProps> | ((props: Partial<TProps>) => Partial<TProps>);

declare module '@optoolco/tonic' {
    export default abstract class Tonic<TProps = void, TState = void> extends Element {
        protected styles(): Object;
        protected stylesheet(): string;
        protected props: Partial<TProps> | TProps;
        protected state: Partial<TState> | TState;
        children: HTMLCollection;
        protected html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult;
        static add<P = void, S = void, T extends Tonic<P, S> = Tonic<P, S>>(
            ClassComponent: Constructor<T>
        ): void;
        static add<P = any, S = any, T extends Tonic<P, S> = Tonic<P, S>>(
            ClassComponent: Constructor<T>
        ): void;
        static add<P = void, S = any, T extends Tonic<P, S> = Tonic<P, S>>(
            ClassComponent: Constructor<T>
        ): void;
        static add<P = any, S = void, T extends Tonic<P, S> = Tonic<P, S>>(
            ClassComponent: Constructor<T>
        ): void;
        abstract render():
            | TemplateResult
            | Promise<TemplateResult>
            | Generator<string, string, unknown>
            | AsyncGenerator<string, string, unknown>
            | null;
        preRender(): TemplateResult;
        protected reRender(propsOrPropsFunction?: PropsOrPropsFunction<TProps>): void;
        static match(el: Element, s: string): Element | null;
        static nonce: string;

        willConnect(): void;
        connected(): void;
        updated(): void;
        disconnected(): void;
    }
}
