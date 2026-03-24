import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, ModalCard, ModalRoot, Panel, PanelHeader, Group, Div, Button, Text, Title, Avatar, Progress, CardGrid, Card } from '@vkontakte/vkui';


import { SplashScreen } from './screens/SplashScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { Question, getQuestions } from './data/questions';
import { UserInfo } from './types';

type Screen = 'splash' | 'welcome' | 'quiz' | 'result' | 'leaderboard' | 'challenge';
type Modal = 'share' | 'achievement' | null;

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
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [quiz, setQuiz] = useState<QuizState>({
    friend: null,
    currentQuestion: 0,
    answers: {},
    completed: false,
  });
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [popout, setPopout] = useState<React.ReactNode>(<ScreenSpinner size="large" />);

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    try {
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      setUser(userInfo as UserInfo);
      
      // Load saved state
      const stored = await bridge.send('VKWebAppStorageGet', { keys: [STORAGE_KEY] });
      if (stored.keys?.[0]?.value) {
        const saved = JSON.parse(stored.keys[0].value);
        setQuiz(saved.quiz || quiz);
        setLeaderboard(saved.leaderboard || []);
        setAchievements(saved.achievements || []);
      }
      
      setPopout(null);
      setTimeout(() => setScreen('welcome'), 500);
    } catch (e) {
      console.error('Init error:', e);
      setPopout(null);
      setTimeout(() => setScreen('welcome'), 500);
    }
  }

  async function saveState() {
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify({ quiz, leaderboard, achievements }),
      });
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  function startQuiz(friend: Friend) {
    setQuiz({ friend, currentQuestion: 0, answers: {}, completed: false });
    setScreen('quiz');
  }

  function answerQuestion(questionIndex: number, answerIndex: number) {
    const questions = getQuestions();
    const newAnswers = { ...quiz.answers, [questionIndex]: answerIndex };
    const newCurrent = quiz.currentQuestion + 1;
    
    if (newCurrent >= questions.length) {
      // Quiz completed
      const score = calculateScore(newAnswers, questions);
      const updatedFriend = { ...quiz.friend!, score };
      
      const newLeaderboard = [...leaderboard.filter(f => f.id !== updatedFriend.id), updatedFriend]
        .sort((a, b) => (b.score || 0) - (a.score || 0));
      
      const newAchievements = [...achievements];
      if (!newAchievements.includes('first_quiz')) {
        newAchievements.push('first_quiz');
      }
      if (score >= 90 && !newAchievements.includes('soulmate')) {
        newAchievements.push('soulmate');
      }
      if (newLeaderboard.length >= 5 && !newAchievements.includes('popular')) {
        newAchievements.push('popular');
      }
      
      setQuiz({ ...quiz, answers: newAnswers, currentQuestion: newCurrent, completed: true });
      setLeaderboard(newLeaderboard);
      setAchievements(newAchievements);
      saveState();
      setTimeout(() => setScreen('result'), 500);
    } else {
      setQuiz({ ...quiz, answers: newAnswers, currentQuestion: newCurrent });
    }
  }

  function calculateScore(answers: Record<number, number>, questions: Question[]): number {
    // Simplified scoring - in real app would compare with friend's answers
    const correct = Object.entries(answers).filter(([qIdx, aIdx]) => {
      const q = questions[parseInt(qIdx)];
      return q && q.correctAnswer === aIdx;
    }).length;
    return Math.round((correct / questions.length) * 100);
  }

  function shareResult() {
    const friend = quiz.friend;
    const score = friend?.score || 0;
    bridge.send('VKWebAppShowWallPostBox', {
      message: `Мой Bestie Index с ${friend?.name}: ${score}%! 🎉\nА ты знаешь своих друзей так же хорошо?\n#Bestie #VKMiniApp`,
    });
  }

  function challengeFriend() {
    setScreen('challenge');
  }

  function openShareModal() {
    setActiveModal('share');
  }

  function openAchievementModal() {
    setActiveModal('achievement');
  }

  const questions = getQuestions();

  return (
    <>
      {popout}
      
      {screen === 'splash' && <SplashScreen />}
      
      {screen === 'welcome' && (
        <WelcomeScreen
          user={user}
          onStart={() => setScreen('challenge')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
      
      {screen === 'quiz' && (
        <QuizScreen
          friend={quiz.friend!}
          question={questions[quiz.currentQuestion]}
          questionIndex={quiz.currentQuestion}
          totalQuestions={questions.length}
          onAnswer={(idx) => answerQuestion(quiz.currentQuestion, idx)}
        />
      )}
      
      {screen === 'result' && (
        <ResultScreen
          friend={quiz.friend!}
          score={quiz.friend?.score || 0}
          achievements={achievements}
          onShare={shareResult}
          onChallenge={challengeFriend}
          onHome={() => setScreen('welcome')}
        />
      )}
      
      {screen === 'leaderboard' && (
        <LeaderboardScreen
          friends={leaderboard}
          onBack={() => setScreen('welcome')}
          onChallenge={challengeFriend}
        />
      )}
      
      {screen === 'challenge' && (
        <ChallengeScreen
          onSelectFriend={startQuiz}
          onBack={() => setScreen('welcome')}
        />
      )}
      
      <ModalRoot activeModal={activeModal}>
        {activeModal === 'share' && (
          <ModalCard
            id="share"
            onClose={() => setActiveModal(null)}
            title="Поделиться результатом"
            actions={[
              { title: 'Поделиться', mode: 'primary', action: shareResult },
              { title: 'Закрыть', mode: 'secondary', action: () => setActiveModal(null) },
            ]}
          >
            <Text>Расскажи друзьям о своём результате!</Text>
          </ModalCard>
        )}
        {activeModal === 'achievement' && (
          <ModalCard
            id="achievement"
            onClose={() => setActiveModal(null)}
            title="🎉 Достижение!"
          >
            <Text>Поздравляем! Ты получил новое достижение.</Text>
          </ModalCard>
        )}
      </ModalRoot>
    </>
  );
}
