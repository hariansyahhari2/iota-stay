'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting promotional images for hotel rooms.
 *
 * The flow takes booking data and market trends as input and uses an LLM to suggest new image URLs and hashes.
 * It exports:
 * - `suggestPromotionalImages`: The main function to trigger the flow.
 * - `SuggestPromotionalImagesInput`: The input type for the function.
 * - `SuggestPromotionalImagesOutput`: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestPromotionalImagesInputSchema = z.object({
  hotelName: z.string().describe('The name of the hotel.'),
  roomType: z.string().describe('The type of the room (e.g., Deluxe, Suite).'),
  bookingData: z.string().describe('JSON string containing recent booking data, including dates and customer demographics.'),
  marketTrends: z.string().describe('JSON string containing current market trends in the hotel industry.'),
});
export type SuggestPromotionalImagesInput = z.infer<typeof SuggestPromotionalImagesInputSchema>;

// Define the output schema
const SuggestPromotionalImagesOutputSchema = z.object({
  suggestedImageUrl: z.string().describe('The URL of the suggested promotional image.'),
  suggestedImageHash: z.string().describe('The SHA-256 hash of the suggested image.'),
  reasoning: z.string().describe('The reasoning behind the image suggestion, based on booking data and market trends.'),
});
export type SuggestPromotionalImagesOutput = z.infer<typeof SuggestPromotionalImagesOutputSchema>;

// Exported function to call the flow
export async function suggestPromotionalImages(input: SuggestPromotionalImagesInput): Promise<SuggestPromotionalImagesOutput> {
  return suggestPromotionalImagesFlow(input);
}

// Define the prompt
const suggestPromotionalImagesPrompt = ai.definePrompt({
  name: 'suggestPromotionalImagesPrompt',
  input: {schema: SuggestPromotionalImagesInputSchema},
  output: {schema: SuggestPromotionalImagesOutputSchema},
  prompt: `You are an AI assistant that suggests promotional images for hotel rooms based on booking data and market trends.

  Given the following information, suggest a new image URL and its SHA-256 hash for a hotel room. Also explain your reasoning.

  Hotel Name: {{{hotelName}}}
  Room Type: {{{roomType}}}
  Booking Data: {{{bookingData}}}
  Market Trends: {{{marketTrends}}}

  Ensure that the suggested image is relevant to the hotel, room type, booking data, and market trends. Provide a SHA-256 hash for the generated image url.
  Consider what would appeal to guests, given the booking data and current trends. For example, if booking data shows families prefer rooms with a view, suggest a promotional image with a great view, or if a certain room feature, like a jacuzzi is very popular make sure it's highlighted.
  `,
});

// Define the flow
const suggestPromotionalImagesFlow = ai.defineFlow(
  {
    name: 'suggestPromotionalImagesFlow',
    inputSchema: SuggestPromotionalImagesInputSchema,
    outputSchema: SuggestPromotionalImagesOutputSchema,
  },
  async input => {
    const {output} = await suggestPromotionalImagesPrompt(input);
    return output!;
  }
);
