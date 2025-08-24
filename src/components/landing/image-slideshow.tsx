'use client';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SlideItem {
  id: number;
  title: string;
  description: string;
  altText: string;
  imagePath: string;
}

interface ImageSlideshowProps {
  items: SlideItem[];
}

export default function ImageSlideshow({ items }: ImageSlideshowProps) {
  const swiperRef = useRef<{ swiper: SwiperType }>(null);
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));

  const goToSlide = (index: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  const goToNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goToPrevious = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      {/* Swiper Container */}
      <div className="relative h-[600px] md:h-[700px]">
        <Swiper
          ref={swiperRef}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          spaceBetween={30}
          loop={true}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 200,
            modifier: 1.5,
            slideShadows: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
          }}
          modules={[EffectCoverflow, Navigation, Pagination]}
          className="w-full h-full"
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          initialSlide={Math.floor(items.length / 2)}
          breakpoints={{
            320: {
              spaceBetween: 20,
              coverflowEffect: {
                depth: 150,
                modifier: 1.2,
              }
            },
            768: {
              spaceBetween: 30,
              coverflowEffect: {
                depth: 200,
                modifier: 1.5,
              }
            },
            1024: {
              spaceBetween: 40,
              coverflowEffect: {
                depth: 250,
                modifier: 1.8,
              }
            }
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id}
              className="w-[280px] md:w-[350px] lg:w-[400px] h-full"
              style={{ 
                width: '280px', 
                height: '100%'
              }}
            >
              <div className="relative w-full h-full group cursor-grab active:cursor-grabbing">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <div className="w-full h-full relative">
                    <img 
                      src={item.imagePath} 
                      alt={item.altText}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - Styled to match page */}
        <button
          onClick={goToPrevious}
          className="swiper-button-prev absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <button
          onClick={goToNext}
          className="swiper-button-next absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Custom Pagination */}
        <div className="swiper-pagination flex justify-center mt-6 space-x-2" />
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-mokka-gy scale-125' 
                : 'bg-gray-300/50 hover:bg-gray-400/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
