"use client";

import { useEffect, useState } from "react";

import type { NewsItem } from "@/lib/shop.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

type ShopHeroCarouselProps = {
  newsItems: NewsItem[];
  buyNowLabel: string;
  fallbackBadgeLabel: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackCtaLabel: string;
  onFallbackCtaAction: () => void;
};

export default function ShopHeroCarousel({
  newsItems,
  buyNowLabel,
  fallbackBadgeLabel,
  fallbackTitle,
  fallbackDescription,
  fallbackCtaLabel,
  onFallbackCtaAction,
}: ShopHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!carouselApi) return;

    const update = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
      setTotalSlides(carouselApi.scrollSnapList().length);
    };

    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);

    return () => {
      carouselApi.off("select", update);
      carouselApi.off("reInit", update);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || totalSlides <= 1) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselApi, totalSlides]);

  if (newsItems.length === 0) {
    return (
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-16">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 shadow-sm md:p-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <Badge className="mb-4 bg-black text-white">
                {fallbackBadgeLabel}
              </Badge>
              <h1 className="mb-3 text-3xl font-bold text-black md:text-4xl lg:text-5xl">
                {fallbackTitle}
              </h1>
              <p className="mb-6 text-base text-gray-600 md:text-lg">
                {fallbackDescription}
              </p>
              <Button
                size="lg"
                className="w-full bg-black text-white hover:bg-gray-800 md:w-auto"
                onClick={onFallbackCtaAction}
              >
                {fallbackCtaLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{ loop: true }}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent>
          {newsItems.map((news) => (
            <CarouselItem key={news.id} className="bg-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 py-8 md:min-h-100 md:flex-row md:items-center md:gap-10 md:py-16">
                  {news.image && (
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 md:flex-1 md:p-8">
                      <img
                        src={news.image}
                        alt={news.title}
                        width={640}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="mx-auto max-h-64 h-auto max-w-full object-contain md:max-h-96"
                      />
                    </div>
                  )}

                  <div className="flex-1 text-center text-black md:text-left">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                      {news.title}
                    </h2>
                    <p className="mb-6 text-base text-gray-600 md:text-lg">
                      {news.description}
                    </p>
                    {news.link && (
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-black text-white hover:bg-gray-800 md:w-auto"
                      >
                        <a href={news.link}>{buyNowLabel}</a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {newsItems.length > 1 && totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={`slide-dot-${index}`}
              onClick={() => carouselApi?.scrollTo(index)}
              className={`h-3 w-3 rounded-full transition-colors ${
                currentSlide === index
                  ? "bg-black"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
