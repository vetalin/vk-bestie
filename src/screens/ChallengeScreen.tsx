import { useState } from 'react';
import { View, Panel, PanelHeader, Group, Div, Button, Title, Text, Card, Input } from '@vkontakte/vkui';
import { Friend } from '../App';
import './ChallengeScreen.css';

interface Props {
  onSelectFriend: (friend: Friend) => void;
  onBack: () => void;
}

export function ChallengeScreen({ onSelectFriend, onBack }: Props) {
  const [friendName, setFriendName] = useState('');

  const handleSubmit = () => {
    if (!friendName.trim()) return;
    
    const friend: Friend = {
      id: Date.now(),
      name: friendName.trim(),
    };
    onSelectFriend(friend);
  };

  return (
    <View activePanel="challenge">
      <Panel id="challenge" className="ChallengeScreen">
        <PanelHeader>Выбери друга</PanelHeader>

        <Group>
          <Div>
            <Button size="l" mode="secondary" onClick={onBack}>
              ← Назад
            </Button>
          </Div>
        </Group>

        <Group>
          <Div className="challenge-intro">
            <Title level="2" className="challenge-title">
              О ком будешь отвечать?
            </Title>
            <Text className="challenge-desc">
              Введи имя друга, о котором хочешь пройти квиз
            </Text>
          </Div>
        </Group>

        <Group>
          <Div>
            <Card className="input-card">
              <Input
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Например: Антон"
                className="friend-input"
              />
              
              <Button
                size="l"
                mode="primary"
                onClick={handleSubmit}
                disabled={!friendName.trim()}
                className="start-quiz-btn"
              >
                🚀 Начать квиз
              </Button>
            </Card>
          </Div>
        </Group>

        <Group>
          <Div className="tip-section">
            <Card className="tip-card">
              <span className="tip-emoji">💡</span>
              <Text className="tip-text">
                Подсказка: выбери друга, о котором ты хорошо знаешь привычки и вкусы!
              </Text>
            </Card>
          </Div>
        </Group>
      </Panel>
    </View>
  );
}
