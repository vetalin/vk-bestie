import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Panel,
  PanelHeader,
  Div,
  Button,
  Text,
  Card,
  Input,
  ScreenSpinner,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import { Question, getQuestions } from './data/questions';
import { UserInfo } from './types';

type Screen = 'splash' | 'welcome' | 'quiz' | 'result' | 'leaderboard' | 'challenge';

export interface Friend {
  id: number;
  name: string;
  avatar?: string;
  score?: number;
  answers?: Record<number, number>;
}

export interface QuizState {
  friend: Friend | null;
  currentQuestion: number;
  answers: Record<number, number>;
  completed: boolean;
}

const STORAGE_KEY = 'bestie_quiz_state';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scheme, setScheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizState>({
    friend: null,
    currentQuestion: 0,
    answers: {},
    completed: false,
  });
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [friendName, setFriendName] = useState('');

  useEffect(() => {
    bridge.subscribe((e) => {
      if (e.detail.type === 'VKWebAppUpdateConfig') {
        setScheme(e.detail.data?.scheme === 'space_gray' ? 'dark' : 'light');
      }
    });
    initApp();
  }, []);

  async function initApp() {
    try {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      setUser(userInfo as UserInfo);

      const stored = await bridge.send('VKWebAppStorageGet', { keys: [STORAGE_KEY] });
      if (stored.keys?.[0]?.value) {
        const saved = JSON.parse(stored.keys[0].value);
        if (saved.quiz) setQuiz(saved.quiz);
        if (saved.leaderboard) setLeaderboard(saved.leaderboard);
        if (saved.achievements) setAchievements(saved.achievements);
      }
    } catch (e) {
      console.error('Init error:', e);
    }
    setLoading(false);
    setTimeout(() => setScreen('welcome'), 300);
  }

  async function saveState(newQuiz: QuizState, newLeaderboard: Friend[], newAchievements: string[]) {
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify({ quiz: newQuiz, leaderboard: newLeaderboard, achievements: newAchievements }),
      });
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  function startQuiz() {
    if (!friendName.trim()) return;
    const friend: Friend = { id: Date.now(), name: friendName.trim() };
    const newQuiz: QuizState = { friend, currentQuestion: 0, answers: {}, completed: false };
    setQuiz(newQuiz);
    setFriendName('');
    setScreen('quiz');
  }

  function answerQuestion(questionIndex: number, answerIndex: number) {
    const questions = getQuestions();
    const newAnswers = { ...quiz.answers, [questionIndex]: answerIndex };
    const newCurrent = quiz.currentQuestion + 1;

    if (newCurrent >= questions.length) {
      const score = calculateScore(newAnswers, questions);
      const updatedFriend = { ...quiz.friend!, score };

      const newLeaderboard = [...leaderboard.filter((f) => f.id !== updatedFriend.id), updatedFriend].sort(
        (a, b) => (b.score || 0) - (a.score || 0),
      );

      const newAchievements = [...achievements];
      if (!newAchievements.includes('first_quiz')) newAchievements.push('first_quiz');
      if (score >= 90 && !newAchievements.includes('soulmate')) newAchievements.push('soulmate');
      if (newLeaderboard.length >= 5 && !newAchievements.includes('popular')) newAchievements.push('popular');

      const newQuiz: QuizState = { ...quiz, answers: newAnswers, currentQuestion: newCurrent, completed: true };
      setQuiz(newQuiz);
      setLeaderboard(newLeaderboard);
      setAchievements(newAchievements);
      saveState(newQuiz, newLeaderboard, newAchievements);
      setTimeout(() => setScreen('result'), 300);
    } else {
      setQuiz({ ...quiz, answers: newAnswers, currentQuestion: newCurrent });
    }
  }

  function calculateScore(answers: Record<number, number>, questions: Question[]): number {
    const correct = Object.entries(answers).filter(([qIdx, aIdx]) => {
      const q = questions[parseInt(qIdx)];
      return q && q.correctAnswer === aIdx;
    }).length;
    return Math.round((correct / questions.length) * 100);
  }

  async function shareResult() {
    const friend = quiz.friend;
    const score = friend?.score || 0;
    try {
      await bridge.send('VKWebAppShowWallPostBox', {
        message: `Мой Bestie Index с ${friend?.name}: ${score}%! 🎉\nА ты знаешь своих друзей так же хорошо?\n#Bestie #VKMiniApp`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  }

  const questions = getQuestions();
  const currentQ = questions[quiz.currentQuestion];
  const score = quiz.friend?.score || 0;
  const sorted = [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));

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
    return 'Похоже, вы ещё узнаёте друг друга';
  };

  return (
    <ConfigProvider colorScheme={scheme}>
      <AppRoot>
        <SplitLayout popout={loading ? <ScreenSpinner size="large" /> : undefined}>
          <SplitCol>
            <View activePanel={screen}>

              {/* SPLASH */}
              <Panel id="splash">
                <Div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <Text style={{ fontSize: '72px', display: 'block', marginBottom: '16px' }}>👯‍♂️</Text>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', display: 'block' }}>Кто твой Bestie?</Text>
                  <ScreenSpinner />
                </Div>
              </Panel>

              {/* WELCOME */}
              <Panel id="welcome">
                <PanelHeader>Кто твой Bestie?</PanelHeader>
                <Div style={{ textAlign: 'center', padding: '40px 20px 16px' }}>
                  <Text style={{ fontSize: '64px', display: 'block', marginBottom: '12px' }}>👯‍♂️</Text>
                  <Text style={{ fontSize: '22px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    Узнай, кто знает тебя лучше всех!
                  </Text>
                  <Text style={{ color: '#888', display: 'block', marginBottom: '24px' }}>
                    Пройди квиз о своих друзьях и открой зеркальный квиз — узнай, совпадают ли ваши ответы!
                  </Text>
                  {user && (
                    <Text style={{ color: '#5181B8', display: 'block', marginBottom: '8px' }}>
                      Привет, {user.first_name}! 👋
                    </Text>
                  )}
                </Div>
                <Div>
                  <Button size="l" mode="primary" stretched onClick={() => setScreen('challenge')}>
                    🚀 Начать квиз
                  </Button>
                </Div>
                <Div>
                  <Button size="l" mode="secondary" stretched onClick={() => setScreen('leaderboard')}>
                    📊 Мой рейтинг друзей
                  </Button>
                </Div>
                <Div style={{ paddingTop: '16px' }}>
                  <Card style={{ padding: '12px 16px', marginBottom: '8px' }}>
                    <Text>🎮 <Text weight="2">Проходи квизы</Text> — отвечай на вопросы о друзьях</Text>
                  </Card>
                  <Card style={{ padding: '12px 16px', marginBottom: '8px' }}>
                    <Text>🤝 <Text weight="2">Зеркальный квиз</Text> — пусть друг ответит о тебе</Text>
                  </Card>
                  <Card style={{ padding: '12px 16px' }}>
                    <Text>🏆 <Text weight="2">Рейтинг друзей</Text> — узнай кто знает тебя лучше</Text>
                  </Card>
                </Div>
              </Panel>

              {/* CHALLENGE */}
              <Panel id="challenge">
                <PanelHeader>Выбери друга</PanelHeader>
                <Div>
                  <Button mode="secondary" onClick={() => setScreen('welcome')}>← Назад</Button>
                </Div>
                <Div style={{ textAlign: 'center', paddingBottom: '8px' }}>
                  <Text style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    О ком будешь отвечать?
                  </Text>
                  <Text style={{ color: '#888', display: 'block' }}>
                    Введи имя друга, о котором хочешь пройти квиз
                  </Text>
                </Div>
                <Div>
                  <Card style={{ padding: '16px' }}>
                    <Input
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      placeholder="Например: Антон"
                      style={{ marginBottom: '12px' }}
                    />
                    <Button size="l" mode="primary" stretched disabled={!friendName.trim()} onClick={startQuiz}>
                      🚀 Начать квиз
                    </Button>
                  </Card>
                </Div>
                <Div>
                  <Card style={{ padding: '12px 16px' }}>
                    <Text>💡 Подсказка: выбери друга, о котором ты хорошо знаешь привычки и вкусы!</Text>
                  </Card>
                </Div>
              </Panel>

              {/* QUIZ */}
              <Panel id="quiz">
                <PanelHeader>Квиз о {quiz.friend?.name || '...'}</PanelHeader>
                {currentQ && (
                  <Div>
                    <Div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <Text style={{ color: '#888', display: 'block' }}>
                        Вопрос {quiz.currentQuestion + 1} из {questions.length}
                      </Text>
                      {/* Simple progress bar without Progress component */}
                      <div style={{
                        height: '4px',
                        background: '#e0e0e0',
                        borderRadius: '2px',
                        margin: '8px 0',
                      }}>
                        <div style={{
                          height: '100%',
                          background: '#5181B8',
                          borderRadius: '2px',
                          width: `${((quiz.currentQuestion + 1) / questions.length) * 100}%`,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </Div>
                    <Div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                      <Text style={{ fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                        {currentQ.text}
                      </Text>
                    </Div>
                    {currentQ.options.map((option, idx) => (
                      <Card
                        key={idx}
                        style={{ padding: '16px', marginBottom: '10px', cursor: 'pointer' }}
                        onClick={() => answerQuestion(quiz.currentQuestion, idx)}
                      >
                        <Text>
                          <Text weight="2">{['А', 'Б', 'В', 'Г'][idx]}.</Text> {option}
                        </Text>
                      </Card>
                    ))}
                  </Div>
                )}
              </Panel>

              {/* RESULT */}
              <Panel id="result">
                <PanelHeader>Результат</PanelHeader>
                <Div style={{ textAlign: 'center', padding: '32px 20px 16px' }}>
                  <Text style={{ fontSize: '56px', display: 'block', marginBottom: '8px' }}>
                    {getScoreEmoji(score)}
                  </Text>
                  <Text style={{ fontSize: '48px', fontWeight: 'bold', display: 'block', color: '#5181B8', marginBottom: '8px' }}>
                    {score}%
                  </Text>
                  <Text style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
                    {getScoreMessage(score)}
                  </Text>
                  <Text style={{ color: '#888', display: 'block', marginBottom: '24px' }}>
                    Bestie: {quiz.friend?.name}
                  </Text>
                </Div>
                {achievements.length > 0 && (
                  <Div>
                    <Text style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>🏆 Достижения</Text>
                    {achievements.includes('first_quiz') && (
                      <Card style={{ padding: '10px 16px', marginBottom: '8px' }}>
                        <Text>🎮 Первый квиз</Text>
                      </Card>
                    )}
                    {achievements.includes('soulmate') && (
                      <Card style={{ padding: '10px 16px', marginBottom: '8px' }}>
                        <Text>💖 Soulmate</Text>
                      </Card>
                    )}
                    {achievements.includes('popular') && (
                      <Card style={{ padding: '10px 16px', marginBottom: '8px' }}>
                        <Text>⭐ Popular</Text>
                      </Card>
                    )}
                  </Div>
                )}
                <Div>
                  <Button size="l" mode="primary" stretched onClick={shareResult} style={{ marginBottom: '10px' }}>
                    📤 Поделиться
                  </Button>
                  <Button size="l" mode="secondary" stretched onClick={() => setScreen('challenge')} style={{ marginBottom: '10px' }}>
                    👥 Бросить вызов
                  </Button>
                  <Button size="l" mode="tertiary" stretched onClick={() => setScreen('welcome')}>
                    🏠 На главную
                  </Button>
                </Div>
              </Panel>

              {/* LEADERBOARD */}
              <Panel id="leaderboard">
                <PanelHeader>Мой рейтинг друзей</PanelHeader>
                <Div>
                  <Button mode="secondary" onClick={() => setScreen('welcome')}>← Назад</Button>
                </Div>
                {sorted.length === 0 ? (
                  <Div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Text style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</Text>
                    <Text style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      Пока нет результатов
                    </Text>
                    <Text style={{ color: '#888', display: 'block', marginBottom: '24px' }}>
                      Пройди первый квиз, чтобы увидеть рейтинг!
                    </Text>
                    <Button size="l" mode="primary" onClick={() => setScreen('challenge')}>
                      🚀 Начать квиз
                    </Button>
                  </Div>
                ) : (
                  <Div>
                    {sorted.map((friend, idx) => (
                      <Card key={friend.id} style={{ padding: '16px', marginBottom: '10px' }}>
                        <Text style={{ display: 'block' }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}{' '}
                          <Text weight="2">{friend.name}</Text>
                          {' — '}
                          <Text style={{ color: '#5181B8' }}>{friend.score}%</Text>
                        </Text>
                        <div style={{
                          height: '4px',
                          background: '#e0e0e0',
                          borderRadius: '2px',
                          marginTop: '8px',
                        }}>
                          <div style={{
                            height: '100%',
                            background: '#5181B8',
                            borderRadius: '2px',
                            width: `${friend.score || 0}%`,
                          }} />
                        </div>
                      </Card>
                    ))}
                  </Div>
                )}
              </Panel>

            </View>
          </SplitCol>
        </SplitLayout>
      </AppRoot>
    </ConfigProvider>
  );
}
