"use client";
import { Star, Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Tiffany B.",
    feedback:
      "David did an awesome job assembling crib and dresser for nursery. Really appreciate this! He cleaned up the area after his work, organized the boxes for easy disposal and went through the directions with us in the event we have to change crib settings.",
    service: "Furniture Assembly",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Nairobi, Kenya",
  },
  {
    id: 2,
    name: "Michael O.",
    feedback:
      "I was very pleased with John's work. He cleaned my apartment thoroughly and even cleaned under the furniture without being asked.",
    service: "House Cleaning",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "Mombasa, Kenya",
  },
  {
    id: 3,
    name: "Sarah W.",
    feedback:
      "The plumbing issue was fixed quickly and professionally. I'm glad I found someone reliable. Highly recommended!",
    service: "Plumbing",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    location: "Kisumu, Kenya",
  },
  {
    id: 4,
    name: "James K.",
    feedback:
      "The TV installation was quick and neatly done. Wires were hidden well, and the wall mount looks perfect!",
    service: "TV Installation",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    location: "Nakuru, Kenya",
  },
  {
    id: 5,
    name: "Angela D.",
    feedback:
      "Very polite and helpful watchman. He kept the premises secure and reported any unusual activity. Felt safe the whole night.",
    service: "Security Services",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    location: "Eldoret, Kenya",
  },
  {
    id: 6,
    name: "Tony M.",
    feedback:
      "Excellent cleaning service. Everything was spotless and smelled great. Will definitely book again!",
    service: "House Cleaning",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/18.jpg",
    location: "Thika, Kenya",
  },
  {
    id: 7,
    name: "Rita N.",
    feedback:
      "They fixed the leaking sink super fast and didn't leave a mess. Very impressed by their professionalism.",
    service: "Plumbing",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    location: "Machakos, Kenya",
  },
  {
    id: 8,
    name: "Mark Z.",
    feedback:
      "My new bookshelf was assembled perfectly. Took less than an hour and everything feels sturdy. Great service!",
    service: "Furniture Assembly",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/61.jpg",
    location: "Nyeri, Kenya",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} transition-colors`}
        />
      ))}
    </div>
  );
};

const Testimonials = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#800000] mb-4">
            Success Stories from Our Clients
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover what our satisfied customers have to say about their
            experience with our trusted service providers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer overflow-hidden"
              onMouseEnter={() => setHoveredCard(testimonial.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="p-6 relative">
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <Quote className="w-8 h-8 text-[#800000]" />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-sm object-cover ring-2 ring-[#800000]/20 group-hover:ring-[#800000]/40 transition-all duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-sm border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#800000] text-lg group-hover:text-[#600000] transition-colors">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-1">
                      {testimonial.location}
                    </p>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-[#800000] to-[#600000] text-white px-3 py-1 rounded-sm text-xs font-semibold shadow-sm">
                    {testimonial.service}
                  </span>
                </div>

                <blockquote className="text-gray-700 text-sm leading-relaxed italic relative">
                  <span className="text-2xl text-[#800000]/30 absolute -top-2 -left-1">
                    "
                  </span>
                  <p className="pl-4">{testimonial.feedback}</p>
                  <span className="text-2xl text-[#800000]/30 absolute -bottom-6 right-0">
                    "
                  </span>
                </blockquote>

                <div
                  className={`mt-6 pt-4 border-t border-gray-100 transition-all duration-300 ${
                    hoveredCard === testimonial.id ? "border-[#800000]/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      Verified Review
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                      <span className="text-xs text-green-600 font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`h-1 bg-gradient-to-r from-[#800000] via-[#600000] to-amber-600 transform transition-transform duration-300 ${
                  hoveredCard === testimonial.id ? "scale-x-100" : "scale-x-0"
                } origin-left`}
              ></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-[#800000] via-[#600000] to-amber-600 text-white px-8 py-3 rounded-sm font-bold hover:from-[#600000] hover:via-[#400000] hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            View All Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
