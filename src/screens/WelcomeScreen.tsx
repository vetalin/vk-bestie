import { View, Panel, PanelHeader, Group, Div, Button, Title, Text, Card, Avatar } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { UserInfo } from '../types';
import './WelcomeScreen.css';

interface Props {
  user: UserInfo | null;
  onStart: () => void;
  onLeaderboard: () => void;
}

export function WelcomeScreen({ user, onStart, onLeaderboard }: Props) {
  return (
    <View activePanel="welcome">
      <Panel id="welcome" className="WelcomeScreen">
        <PanelHeader>Кто твой Bestie?</PanelHeader>
        
        <Group>
          <Div className="hero-section">
            <div className="hero-emoji">👯‍♂️</div>
            <Title level="1" className="hero-title">Узнай, кто знает тебя лучше всех!</Title>
            <Text className="hero-subtitle">
              Пройди квиз о своих друзьях и открой зеркальный квиз — узнай, совпадают ли ваши ответы!
            </Text>
          </Div>
        </Group>

        <Group>
          <Div>
            <Button 
              size="l" 
              mode="primary" 
              onClick={onStart}
              className="cta-button"
            >
              🚀 Начать квиз
            </Button>
          </Div>
          <Div>
            <Button 
              size="l" 
              mode="secondary" 
              onClick={onLeaderboard}
              className="secondary-button"
            >
              📊 Мой рейтинг друзей
            </Button>
          </Div>
        </Group>

        <Group>
          <Div>
            <Card className="feature-card">
              <div className="feature-item">
                <span className="feature-emoji">🎮</span>
                <div>
                  <Text weight="2">Проходи квизы</Text>
                  <Text className="feature-desc">Отвечай на вопросы о друзьях</Text>
                </div>
              </div>
            </Card>
          </Div>
          <Div>
            <Card className="feature-card">
              <div className="feature-item">
                <span className="feature-emoji">🤝</span>
                <div>
                  <Text weight="2">Зеркальный квиз</Text>
                  <Text className="feature-desc">Пусть друг ответит о тебе</Text>
                </div>
              </div>
            </Card>
          </Div>
          <Div>
            <Card className="feature-card">
              <div className="feature-item">
                <span className="feature-emoji">🏆</span>
                <div>
                  <Text weight="2">Рейтинг друзей</Text>
                  <Text className="feature-desc">Узнай кто знает тебя лучше всех</Text>
                </div>
              </div>
            </Card>
          </Div>
        </Group>

        {user && (
          <Group>
            <Div className="user-info">
              <Avatar src={user.photo_200} size={48} />
              <Text>{user.first_name}</Text>
            </Div>
          </Group>
        )}
      </Panel>
    </View>
  );
}
