import { getCategories } from '@/services/category.service'
import { getAllProducts } from '@/services/product.service'
import { SITE_URL } from '@/lib/constants'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL || 'https://hzastore.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categoriesResult = await getCategories()
    if (!categoriesResult.error && categoriesResult.data) {
      categoryPages = (categoriesResult.data as Array<{ slug: string; updated_at?: string }>).map((cat) => ({
        url: `${baseUrl}/categories/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch {
    // ignore
  }

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const productsResult = await getAllProducts({ limit: 1000 })
    if (!productsResult.error && productsResult.data) {
      const productList = productsResult.data.data || []
      productPages = (productList as Array<{ slug: string; updated_at?: string }>).map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // ignore
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
