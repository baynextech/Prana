import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export function SEOMeta({ title, description, keywords, canonicalUrl }: SEOMetaProps) {
  useEffect(() => {
    // Update title
    document.title = title ? `${title} | Prana` : "Prana - Profesores, Estudios y Clases de Yoga";

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Update meta keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // Update canonical link
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute("href", canonicalUrl);
    }
  }, [title, description, keywords, canonicalUrl]);

  return null;
}
