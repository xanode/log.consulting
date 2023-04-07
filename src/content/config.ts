// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
// 2. Define your collection(s)
const jobCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        salary: z.string(),
        starting_date: z.date(),
        experience: z.string(),
        job_name: z.string(),
        job_status: z.string(),
        travel_area: z.string(),
        job_sector: z.string(),
        telework: z.string(),
        hr_name: z.string(),
        hr_email: z.string().email(),
        hr_phone: z.string(),
    })
});
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  'job': jobCollection,
};