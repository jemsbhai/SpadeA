import type { DefendantResponse, SuggestedReply } from '@/lib/types';
import { callDefendant } from './agentRouter';

export async function getDefendantSuggestions(exchangeCount: number): Promise<DefendantResponse> {
  const json = await callDefendant(exchangeCount);
  const data = JSON.parse(json) as DefendantResponse;
  if (!data.suggestions || data.suggestions.length === 0) throw new Error('Invalid defendant response: no suggestions');

  const suggestions: SuggestedReply[] = data.suggestions.map((s) => ({
    text: s.text,
    type: s.type || 'strategic',
    variant: s.variant || 'default',
  }));

  const surrenderIdx = suggestions.findIndex((s) => s.variant === 'surrender');
  if (surrenderIdx >= 0 && surrenderIdx !== suggestions.length - 1) {
    const [surrenderChip] = suggestions.splice(surrenderIdx, 1);
    suggestions.push(surrenderChip);
  }
  if (exchangeCount >= 6 && !suggestions.find((s) => s.variant === 'surrender')) {
    suggestions.push({ text: '...I surrender.', type: 'surrender', variant: 'surrender' });
  }

  return {
    suggestions,
    defense_analysis: data.defense_analysis ?? 'No analysis',
    recommended_strategy: data.recommended_strategy ?? 'No recommendation',
  };
}
