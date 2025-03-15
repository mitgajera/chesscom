declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  import { Root } from 'react-dom';

  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}