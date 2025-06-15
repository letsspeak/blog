// src/pages/Home.tsx
import { useEffect, useState } from "react";
type Meta = { title: string; date: string; slug: string; path: string };

export default function Home() {
  const [posts, setPosts] = useState<Meta[]>([]);
  useEffect(() => {
    fetch("/blog/src/posts-index.json")
      .then(r => r.json())
      .then(setPosts);
  }, []);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      <ul>
        {posts.map(p => (
          <li key={p.slug}>
            <a href={`/blog/posts/${p.date.slice(0,7)}/${p.slug}`}>
              {p.date} — {p.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
