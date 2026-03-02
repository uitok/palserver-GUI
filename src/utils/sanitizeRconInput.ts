/**
 * Sanitize user input before sending as part of an RCON command.
 * Removes characters that could be used for command injection.
 */
export default function sanitizeRconInput(input: string): string {
  return input
    .replace(/[\n\r]/g, '') // Remove newlines
    .replace(/;/g, '') // Remove semicolons (command separator)
    .trim();
}
