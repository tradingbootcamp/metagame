import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

export interface FAQItem {
  id: number
  question: string
  content: string
  contentHtml: string
  slug: string
}

// Simple function to convert basic markdown to HTML
function simpleMarkdownToHtml(content: string): string {
  // Split content into paragraphs (separated by double newlines)
  const paragraphs = content.split(/\n\n+/)

  return paragraphs
    .map((paragraph) => {
      // Check if this paragraph is a list
      const lines = paragraph.trim().split('\n')
      const isAllListItems = lines.every(
        (line) => line.trim().startsWith('- ') || line.trim() === '',
      )

      if (isAllListItems) {
        // Convert to HTML list
        const listItems = lines
          .filter((line) => line.trim().startsWith('- '))
          .map((line) => {
            let content = line.substring(2).trim()
            // Convert bold text
            content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            return `<li>${content}</li>`
          })
          .join('\n')
        return `<ul>${listItems}</ul>`
      } else {
        // Regular paragraph
        let processed = paragraph.trim()
        // Convert bold text
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

        // Don't wrap empty strings in p tags
        if (!processed) return ''

        return `<p>${processed}</p>`
      }
    })
    .filter((html) => html !== '') // Remove empty elements
    .join('\n')
}

export async function getFAQs(): Promise<FAQItem[]> {
  const faqDirectory = path.join(process.cwd(), 'content', 'faq')
  const fileNames = fs.readdirSync(faqDirectory)

  const faqs = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(faqDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Convert to simple HTML
      const contentHtml = simpleMarkdownToHtml(content)

      return {
        id: data.id,
        question: data.question,
        content,
        contentHtml,
        slug,
      }
    })

  return faqs.sort((a, b) => a.id - b.id)
}
export interface Partner {
  id: number
  name: string
  logo: string
  logoSize?: string
  wideLogo?: boolean
  website?: string
  type: 'organizer' | 'supporter' | 'sponsor' | 'media' | "drinks'n'bytes"
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'headline'
  description?: string
  tagline?: string
  industry?: string
  twitter?: string
  linkedin?: string
  github?: string
}
