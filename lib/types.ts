export interface TicketType {
  id: string
  title: string
  priceUSD: number
  priceBTC?: number
  applicationBased: boolean
  live: boolean //whether the apply/purchase button for this ticket should be disabled
  ticketUrl?: string
  regularPrice?: number
  description: string | React.ReactNode
  finePrint?: string
  features?: string[]
}

export type DisplayTicketType = Omit<TicketType, 'priceUSD' | 'priceBTC'> & {
  priceUSD: string
  priceBTC?: string
}

/** Takes params that contain either an id or an email, but not both */
export type IdXorEmail =
  | { id: string; email?: never }
  | { id?: never; email: string }

export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : `Error: Object has extra keys '${Exclude<keyof T, keyof Shape> & string}'`
  : `Error: Object has missing keys '${Exclude<keyof Shape, keyof T> & string}'`
