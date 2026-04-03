import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

const SEOHead = ({
  title,
  description,
  keywords = "career guidance, education, colleges, scholarships, AI recommendations, aptitude test, career counseling, India",
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType = "website",
  canonicalUrl,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string, attribute: string = "content") => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        const nameMatch = selector.match(/name="([^"]+)"/);
        const propertyMatch = selector.match(/property="([^"]+)"/);
        if (nameMatch) element.setAttribute("name", nameMatch[1]);
        if (propertyMatch) element.setAttribute("property", propertyMatch[1]);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update meta description
    updateMetaTag('meta[name="description"]', description);
    
    // Update keywords
    updateMetaTag('meta[name="keywords"]', keywords);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', ogImage);
    updateMetaTag('meta[property="og:type"]', ogType);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', ogImage);

    // Update canonical URL if provided
    if (canonicalUrl) {
      let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalElement) {
        canonicalElement = document.createElement("link");
        canonicalElement.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute("href", canonicalUrl);
    }

    // Cleanup function
    return () => {
      // Reset to default title when component unmounts
      // document.title = "AVSAR - AI Career & Education Guidance";
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);

  return null;
};

export default SEOHead;
