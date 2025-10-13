import type { Product } from "../Interfaces/product";

  export const products: Product[] = [
    {
      id: 8,
      price: 0,
      name: "15-Minute FREE Strategy Call",
      Duration: "Unlimited",
      save: 0,
      badge: {
        text: "FREE",
        color: "bg-green-600"
      },
      Description:
        "No sales pitch. No wasted time. Just a focused strategy session to give you clarity and direction for your LSAT prep.",
    },
    {
      id: 5,
      price: 125,
      name: "60-Minute Single Prep",
      save:75,
      Duration: "Unlimited",
      badge: {
        text: "Only 3 slots left",
        color: "bg-orange-500"
      },
      Description:
        "Need flexibility? Book individual LSAT tutoring sessions as you go",
    },
    {
      id: 6,
      price: 577,
      save: 100,
      name: "5X Prep Session Bundle",
      Duration: "Unlimited",
      badge: {
        text: "Most Popular",
        color: "bg-blue-600"
      },
      Description:
        "Our most popular option for consistent, focused prep.",
    },
        {
      id: 7,
      price: 1100,
      save:150,
      name: "10X Prep Session Bundle",
      Duration: "Unlimited",
      badge: {
        text: "Hot Selling",
        color: "bg-red-500"
      },
      Description:
        "Built for long-term gains and higher score jumps.",
    }
  ];