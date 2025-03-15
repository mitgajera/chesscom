declare module 'embla-carousel-react' {
  import { EmblaCarouselType } from 'embla-carousel';

  export default function useEmblaCarousel(
    options?: Record<string, unknown>,
    plugins?: unknown[]
  ): [React.RefObject<HTMLDivElement>, EmblaCarouselType];

  export type { EmblaCarouselType };
}