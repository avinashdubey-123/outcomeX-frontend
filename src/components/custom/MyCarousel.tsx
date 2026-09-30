import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface MyCarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
}

export function MyCarousel<T>({ items, renderItem }: MyCarouselProps<T>) {
  const delay = 5000
  return (
    <Carousel
      plugins={[Autoplay({ delay: delay })]}
      opts={{
        align: "start",
        loop: true,
        skipSnaps: true,
      }}
      className="w-full font-liberation"
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="basis-full">
            {renderItem(item, index)}
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="-left-4 bg-primary   hover:bg-[#252D3A] text-black" />
      <CarouselNext className="-right-4 bg-primary  hover:bg-[#252D3A] text-black" />
    </Carousel>
  )
}
