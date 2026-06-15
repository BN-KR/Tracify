import groq from "groq";

export const postFields = groq`
  _id,
  title,
  "slug": slug.current,
  "date": publishedAt,
  excerpt,
  author,
  categories,
  tags,
  coverImage,
  seo,
  body
`;

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${postFields}
  }
`;

export const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields}
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const recentPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...5] {
    _id,
    title,
    "slug": slug.current,
    "date": publishedAt,
    excerpt,
    coverImage,
  }
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && $category in categories && defined(slug.current)] | order(publishedAt desc) {
    ${postFields}
  }
`;
