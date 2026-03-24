import { View, Panel, PanelHeader, Group, Div, Button, Title, Text, Card, Avatar } from '@vkontakte/vkui';
import { Friend } from '../App';
import './LeaderboardScreen.css';

interface Props {
  friends: Friend[];
  onBack: () => void;
  onChallenge: () => void;
}

export function LeaderboardScreen({ friends, onBack, onChallenge }: Props) {
  const sorted = [...friends].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <View activePanel="leaderboard">
      <Panel id="leaderboard" className="LeaderboardScreen">
        <PanelHeader>Мой рейтинг друзей</PanelHeader>

        <Group>
          <Div>
            <Button size="l" mode="secondary" onClick={onBack}>
              ← Назад
            </Button>
          </Div>
        </Group>

        {sorted.length === 0 ? (
          <Group>
            <Div className="empty-state">
              <span className="empty-emoji">📊</span>
              <Title level="3">Пока нет результатов</Title>
              <Text className="empty-desc">
                Пройди первый квиз, чтобы увидеть рейтинг!
              </Text>
              <Button size="m" mode="primary" onClick={onChallenge} className="start-btn">
                🚀 Начать квиз
              </Button>
            </Div>
          </Group>
        ) : (
          <Group>
            <Div className="leaderboard-list">
              {sorted.map((friend, idx) => (
                <Card key={friend.id} className={`leaderboard-item rank-${idx + 1}`}>
                  <div className="leaderboard-rank">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <Avatar size={48} src={friend.avatar} />
                  <div className="leaderboard-info">
                    <Text weight="2">{friend.name}</Text>
                    <Text className="leaderboard-score">{friend.score}% совпадение</Text>
                  </div>
                  <div className="leaderboard-bar">
                    <div 
                      className="leaderboard-bar-fill" 
                      style={{ width: `${friend.score || 0}%` }}
                    />
                  </div>
                </Card>
              ))}
            </Div>
          </Group>
        )}
      </Panel>
    </View>
  );
}
