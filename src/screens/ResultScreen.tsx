import { View, Panel, PanelHeader, Group, Div, Button, Title, Text, Card, Avatar } from '@vkontakte/vkui';
import { Friend } from '../App';
import './ResultScreen.css';

interface Props {
  friend: Friend;
  score: number;
  achievements: string[];
  onShare: () => void;
  onChallenge: () => void;
  onHome: () => void;
}

export function ResultScreen({ friend, score, achievements, onShare, onChallenge, onHome }: Props) {
  const getScoreEmoji = (s: number) => {
    if (s >= 90) return '💖';
    if (s >= 70) return '😊';
    if (s >= 50) return '🤔';
    return '😅';
  };

  const getScoreMessage = (s: number) => {
    if (s >= 90) return 'Идеальное совпадение! Вы настоящие bestie!';
    if (s >= 70) return 'Отлично! Вы хорошо знаете друг друга';
    if (s >= 50) return 'Неплохо! Есть что улучшить';
    return 'Похоже, вы ещё узнаете друг друга';
  };

  return (
    <View activePanel="result">
      <Panel id="result" className="ResultScreen">
        <PanelHeader separator={false}>Результат</PanelHeader>

        <Group className="result-hero">
          <Div className="confetti-container">
            <span className="confetti-emoji">🎉</span>
            <span className="confetti-emoji">🎊</span>
            <span className="confetti-emoji">✨</span>
          </div>
          
          <div className="score-circle">
            <span className="score-emoji">{getScoreEmoji(score)}</span>
            <span className="score-value">{score}%</span>
          </div>
          
          <Title level="1" className="result-title">
            {getScoreMessage(score)}
          </Title>
          
          <div className="friend-result-info">
            <Avatar size={56} src={friend.avatar} />
            <Text weight="semibold" className="friend-result-name">
              {friend.name}
            </Text>
          </div>
        </Group>

        <Group>
          <Div>
            <Title level="3" className="section-title">🏆 Достижения</Title>
            <div className="achievements-grid">
              {achievements.includes('first_quiz') && (
                <div className="achievement-badge">🎮 Первый квиз</div>
              )}
              {achievements.includes('soulmate') && (
                <div className="achievement-badge">💖 Soulmate</div>
              )}
              {achievements.includes('popular') && (
                <div className="achievement-badge">⭐ Popular</div>
              )}
            </div>
          </Div>
        </Group>

        <Group>
          <Div className="action-buttons">
            <Button 
              size="l" 
              mode="primary" 
              onClick={onShare}
              className="share-btn"
            >
              📤 Поделиться
            </Button>
            <Button 
              size="l" 
              mode="secondary" 
              onClick={onChallenge}
              className="challenge-btn"
            >
              👥 Бросить вызов
            </Button>
            <Button 
              size="l" 
              mode="tertiary" 
              onClick={onHome}
            >
              🏠 На главную
            </Button>
          </Div>
        </Group>
      </Panel>
    </View>
  );
}
