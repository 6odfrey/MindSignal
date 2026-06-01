const CRISIS_KEYWORDS = [
  // Suicidal ideation
  'suicide', 'suicidal', 'kill myself', 'end my life', 'take my life',
  'want to die', 'want to be dead', 'better off dead', 'better off without me',
  'no reason to live', 'cant go on', "can't go on", 'ending it all',
  'not worth living', 'life is not worth',
  // Self-harm
  'self harm', 'self-harm', 'cut myself', 'hurt myself', 'harming myself',
  // Crisis states
  'in crisis', 'having a crisis', 'breaking down', 'cant cope', "can't cope",
  'no way out', 'hopeless', 'completely hopeless', 'give up on life',
];

export function detectCrisis(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}
