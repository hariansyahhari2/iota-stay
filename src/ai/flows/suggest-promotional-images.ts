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
