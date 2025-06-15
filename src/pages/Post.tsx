// src/pages/Post.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Post() {
  const { year, slug } = useParams();
  const [html, setHtml] = useState("");
  useEffect(() => {
    fetch(`/articles/${year}/${slug}.html`)
      .then(r => r.text())
      .then(setHtml);
  }, [year, slug]);
  return (
    <article
      className="prose mx-auto p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
