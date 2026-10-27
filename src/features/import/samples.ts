import type { ProjectSource } from "@/shared/store/types";

export type SampleProject = {
  id: string;
  title: string;
  description: string;
  source: ProjectSource;
  text: string;
};

const nextApp = `{
  "name": "uplift-next-app",
  "private": true,
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.24.0",
    "@tanstack/react-query": "^5.80.0",
    "zustand": "^5.0.0",
    "sonner": "^2.0.0",
    "next-themes": "^0.4.4"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/react": "^19.1.0",
    "@types/node": "^22.15.0",
    "eslint": "^9.25.0",
    "vitest": "^3.1.0",
    "tailwindcss": "^4.1.0"
  }
}`;

const viteReact = `{
  "name": "uplift-vite-app",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "^7.6.0",
    "axios": "^1.8.0",
    "lodash": "^4.17.21",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "vite": "^6.3.0",
    "typescript": "^5.7.0",
    "@vitejs/plugin-react": "^4.4.0",
    "eslint": "^9.24.0",
    "prettier": "^3.5.0"
  }
}`;

const expressApi = `{
  "name": "uplift-express-api",
  "private": true,
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "pg": "^8.13.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.0",
    "request": "^2.88.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0",
    "supertest": "^7.1.0"
  }
}`;

export const SAMPLE_PROJECTS: readonly SampleProject[] = [
  {
    id: "next",
    title: "Next.js app",
    description: "App Router stack with Query, Zustand and Zod. Mix of current and behind packages.",
    source: "sample",
    text: nextApp,
  },
  {
    id: "vite",
    title: "Vite React app",
    description: "SPA with axios, lodash and React 18. Several majors sitting behind.",
    source: "sample",
    text: viteReact,
  },
  {
    id: "express",
    title: "Express API",
    description: "Node service that still lists the deprecated request package.",
    source: "sample",
    text: expressApi,
  },
];
