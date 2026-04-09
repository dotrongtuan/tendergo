import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Chip } from './Chip';
import { Card } from './Card';
import { useAppTheme } from '../theme';
import type { OptionId, Question } from '../types/models';
import { getDifficultyLabel } from '../utils/format';

interface QuestionCardProps {
  question: Question;
  optionOrder?: OptionId[];
  selectedAnswer?: OptionId | null;
  showResult?: boolean;
  showExplanation?: boolean;
  disableSelection?: boolean;
  onSelectAnswer?: (optionId: OptionId) => void;
}

export function QuestionCard({
  question,
  optionOrder,
  selectedAnswer,
  showResult = false,
  showExplanation = false,
  disableSelection = false,
  onSelectAnswer,
}: QuestionCardProps) {
  const theme = useAppTheme();
  const orderedOptions = optionOrder
    ? optionOrder.map((optionId) => question.options.find((option) => option.id === optionId)).filter(Boolean)
    : question.options;

  return (
    <Card>
      <View style={styles.header}>
        <Chip label={getDifficultyLabel(question.difficulty)} tone="accent" />
        <Text style={[styles.source, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{question.source}</Text>
      </View>
      <Text style={[styles.question, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{question.question}</Text>
      <View style={styles.options}>
        {orderedOptions.map((option) => {
          if (!option) {
            return null;
          }
          const isSelected = selectedAnswer === option.id;
          const isCorrect = question.correctAnswer === option.id;
          const backgroundColor = showResult
            ? isCorrect
              ? `${theme.colors.success}18`
              : isSelected
                ? `${theme.colors.danger}18`
                : theme.colors.surfaceMuted
            : isSelected
              ? theme.colors.chipBackground
              : theme.colors.surfaceMuted;

          return (
            <TouchableOpacity
              key={option.id}
              disabled={disableSelection}
              onPress={() => onSelectAnswer?.(option.id)}
              style={[styles.option, { backgroundColor, borderColor: isSelected ? theme.colors.primary : theme.colors.border }]}
            >
              <Text style={[styles.optionKey, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>{option.id}</Text>
              <Text style={[styles.optionLabel, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {showExplanation ? (
        <View style={[styles.explanationBox, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[styles.explanationTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Giải thích</Text>
          <Text style={[styles.explanationBody, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{question.explanation}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  source: { fontSize: 12 },
  question: { fontSize: 17, lineHeight: 24 },
  options: { gap: 10 },
  option: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  optionKey: { fontSize: 14, minWidth: 18 },
  optionLabel: { flex: 1, fontSize: 14, lineHeight: 22 },
  explanationBox: { borderRadius: 18, padding: 14, gap: 6 },
  explanationTitle: { fontSize: 13 },
  explanationBody: { fontSize: 14, lineHeight: 22 },
});
