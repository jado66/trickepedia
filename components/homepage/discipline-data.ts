// Central shared discipline data so multiple components (hero dropdown, cards, etc.)
// stay in sync. Extend or modify here when adding/removing disciplines.

export interface Discipline {
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string; // tailwind gradient classes segment (without the bg-gradient-to-*)
}

export const disciplines: Discipline[] = [
  {
    name: "Parkour",
    slug: "parkour",
    description: "Master vaults, precision jumps, and flow",
    image:
      "https://images.unsplash.com/photo-1550701035-c0bb32de8aca?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    name: "Tricking",
    slug: "tricking",
    description: "Perfect flips, kicks, and combinations",
    image:
      "https://t3.ftcdn.net/jpg/02/06/54/94/360_F_206549476_7Z0xzTgOGiYSFn9iQK6pVI7oCY0omeAj.jpg",
    color: "from-blue-500/20 to-purple-500/20",
  },
  {
    name: "Trampoline",
    slug: "trampoline",
    description: "Learn twists, somersaults, and sequences",
    image:
      "https://i.ytimg.com/vi/4jnfqBUw6gg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCW-IaG9dFHIUGjJugFnbYcd5sqQA",
    color: "from-green-500/20 to-teal-500/20",
  },
  {
    name: "Trampwall",
    slug: "trampwall",
    description: "Combine wall runs with aerial tricks",
    image: "https://i.ytimg.com/vi/QYB-sSpxvw4/maxresdefault.jpg",
    color: "from-pink-500/20 to-orange-500/20",
  },
  {
    name: "Tumbling",
    slug: "tumbling",
    description: "Build power with rolls, handsprings, and flips",
    image:
      "https://media.cbs8.com/assets/CCT/images/ecee4a64-2299-41e5-8b17-604a6a04fd6d/20240731T184157/ecee4a64-2299-41e5-8b17-604a6a04fd6d_750x422.jpg",
    color: "from-purple-500/20 to-pink-500/20",
  },
];
