"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselEvent = "reInit" | "select"

type CarouselApi = {
  canScrollNext: () => boolean
  canScrollPrev: () => boolean
  off: (event: CarouselEvent, callback: () => void) => void
  on: (event: CarouselEvent, callback: () => void) => void
  scrollNext: () => void
  scrollPrev: () => void
  scrollSnapList: () => number[]
  scrollTo: (index: number) => void
  selectedScrollSnap: () => number
}

type CarouselOptions = {
  axis?: "x" | "y"
  loop?: boolean
  startIndex?: number
}

type CarouselPlugin = unknown[]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  api: CarouselApi
  carouselRef: React.RefObject<HTMLDivElement | null>
  currentIndex: number
  scrollPrev: () => void
  scrollNext: () => void
  setSlideCount: (count: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const apiRef = React.useRef<CarouselApi | null>(null)
  const listenersRef = React.useRef<Record<CarouselEvent, Set<() => void>>>({
    reInit: new Set(),
    select: new Set(),
  })
  const selectedIndexRef = React.useRef(opts?.startIndex ?? 0)
  const slideCountRef = React.useRef(0)
  const loopRef = React.useRef(Boolean(opts?.loop))
  const [currentIndex, setCurrentIndex] = React.useState(opts?.startIndex ?? 0)
  const [slideCount, setSlideCount] = React.useState(0)

  void plugins

  const resolvedOrientation =
    orientation === "vertical" || opts?.axis === "y" ? "vertical" : "horizontal"

  const emit = React.useCallback((event: CarouselEvent) => {
    for (const callback of listenersRef.current[event]) {
      callback()
    }
  }, [])

  const normalizeIndex = React.useCallback((index: number) => {
    const count = slideCountRef.current

    if (count <= 0) {
      return 0
    }

    if (loopRef.current) {
      return ((index % count) + count) % count
    }

    return Math.min(Math.max(index, 0), count - 1)
  }, [])

  const updateIndex = React.useCallback(
    (index: number) => {
      setCurrentIndex((previousIndex) => {
        const nextIndex = normalizeIndex(index)
        return previousIndex === nextIndex ? previousIndex : nextIndex
      })
    },
    [normalizeIndex]
  )

  if (!apiRef.current) {
    apiRef.current = {
      canScrollNext: () => {
        const count = slideCountRef.current
        if (count <= 1) return false
        return loopRef.current || selectedIndexRef.current < count - 1
      },
      canScrollPrev: () => {
        const count = slideCountRef.current
        if (count <= 1) return false
        return loopRef.current || selectedIndexRef.current > 0
      },
      off: (event, callback) => {
        listenersRef.current[event].delete(callback)
      },
      on: (event, callback) => {
        listenersRef.current[event].add(callback)
      },
      scrollNext: () => {
        updateIndex(selectedIndexRef.current + 1)
      },
      scrollPrev: () => {
        updateIndex(selectedIndexRef.current - 1)
      },
      scrollSnapList: () =>
        Array.from({ length: slideCountRef.current }, (_, index) => index),
      scrollTo: (index) => {
        updateIndex(index)
      },
      selectedScrollSnap: () => selectedIndexRef.current,
    }
  }

  const api = apiRef.current

  const canScrollPrev = api.canScrollPrev()
  const canScrollNext = api.canScrollNext()

  const scrollPrev = React.useCallback(() => {
    api.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    selectedIndexRef.current = currentIndex
    emit("select")
  }, [currentIndex, emit])

  React.useEffect(() => {
    slideCountRef.current = slideCount
    loopRef.current = Boolean(opts?.loop)
    setCurrentIndex((previousIndex) => normalizeIndex(previousIndex))
    emit("reInit")
  }, [emit, normalizeIndex, opts?.loop, slideCount])

  React.useEffect(() => {
    if (!setApi) return
    setApi(api)
  }, [api, setApi])

  return (
    <CarouselContext.Provider
      value={{
        api: api,
        carouselRef,
        currentIndex,
        opts,
        orientation: resolvedOrientation,
        scrollPrev,
        scrollNext,
        setSlideCount,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const { carouselRef, currentIndex, orientation, setSlideCount } = useCarousel()
  const childCount = React.Children.count(children)

  React.useEffect(() => {
    setSlideCount(childCount)
  }, [childCount, setSlideCount])

  React.useEffect(() => {
    return () => {
      setSlideCount(0)
    }
  }, [setSlideCount])

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex transition-transform duration-300 ease-out",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        style={{
          transform:
            orientation === "horizontal"
              ? `translate3d(-${currentIndex * 100}%, 0, 0)`
              : `translate3d(0, -${currentIndex * 100}%, 0)`,
          ...style,
        }}
        aria-live="polite"
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
