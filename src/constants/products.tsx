import type { Product } from "../Interfaces/product";

  export const products: Product[] = [
    {
      id: 8,
      price: 0,
      name: "15-Minute FREE Strategy Call",
      Duration: "Unlimited",
      Description:
        "No sales pitch. No wasted time. Just a focused strategy session to give you clarity and direction for your LSAT prep.",
    },
    {
      id: 5,
      price: 125,
      name: "60-Minute Single Prep",
      Duration: "Unlimited",
      Description:
        "Need flexibility? Book individual LSAT tutoring sessions as you go—perfect for targeted help when you're stuck on a specific question type or section",
    },
    {
      id: 6,
      price: 577,
      name: "5X Prep Session Bundle",
      Duration: "Unlimited",
      Description:
        "Our most popular option for consistent, focused prep.This 5-session bundle is perfect for students on a short-term timeline who want structured support without committing long-term.",
    },
        {
      id: 7,
      price: 1100,
      name: "10X Prep Session Bundle",
      Duration: "Unlimited",
      Description:
        "Built for long-term gains and higher score jumps.The 10-session package is ideal for students with a clear goal and time to put in the work.",
    }
  ];