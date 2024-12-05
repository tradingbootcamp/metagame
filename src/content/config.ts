import { z, defineCollection } from "astro:content";
import { TypeFlags } from "typescript";

const speakersCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    title: z.string(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

const miscsCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    title: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

const moderatorsCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    title: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});


const commetteeCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    title: z.string().optional(),
    website: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

const sessionsCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    speakerId: z.array(z.number()),
    miscId: z.array(z.number()).optional(),
    title: z.string(),
    time: z.string(),
    date: z.date(),
    duration: z.number(),
    format: z.string(),
    venue: z.string(),
    stage: z.number().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const faqCollection = defineCollection({
  type: "content",
  schema: z.object({
    id: z.number(),
    question: z.string(),
  }),
});

const agendaCollection = defineCollection({
  type: "data",
  schema: z.object({
    id: z.number(),
    name: z.string().optional(),
    venue: z.string().optional(),
    date: z.string(),
    sessions: z.array(
      z.object({
        id: z.number(),
        time: z.string(),
        sessionId: z.number(),
      })
    ),
    description: z.string().optional(),
    registrationLink: z.string().optional(),
  }),
});

const partnersCollection = defineCollection({
  type: "data",
  schema: z
    .object({
      id: z.number(),
      name: z.string(),
      logo: z.string(),
      logoSize: z.string().optional(),
      wideLogo: z.boolean().optional(),
      website: z.string(),
      type: z.enum([
        "organizer",
        "supporter",
        "sponsor",
        "media",
        "drinks'n'bytes",
      ]),
      tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
    })
    .refine(
      (data) => {
        if (
          data.type === "organizer" ||
          data.type === "supporter" ||
          data.type === "media"
        ) {
          return data.tier !== undefined;
        }
        return true;
      },
      {
        message: "Tier is required if type is sponsor",
        path: ["tier"],
      }
    ),
});

export const collections = {
  speakers: speakersCollection,
  committee: commetteeCollection,
  moderators: moderatorsCollection,
  miscs: miscsCollection,
  sessions: sessionsCollection,
  faq: faqCollection,
  agenda: agendaCollection,
  partner: partnersCollection,
};
