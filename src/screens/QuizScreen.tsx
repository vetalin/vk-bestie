import { View, Panel, PanelHeader, Group, Div, Button, Progress, Title, Text } from '@vkontakte/vkui';
import { Friend } from '../App';
import { Question } from '../types';
import './QuizScreen.css';

interface Props {
  friend: Friend;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
}

export function QuizScreen({ friend, question, questionIndex, totalQuestions, onAnswer }: Props) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  const categoryEmoji = {
    food: '🍕',
    habits: '⏰',
    stories: '📖',
    fun: '🎮',
  }[question.category];

  return (
    <View activePanel="quiz">
      <Panel id="quiz" className="QuizScreen">
        <PanelHeader>Квиз о {friend.name}</PanelHeader>

        <Group className="quiz-content">
          <Div className="progress-section">
            <div className="progress-info">
              <Text className="progress-text">
                Вопрос {questionIndex + 1} из {totalQuestions}
              </Text>
              <span className="category-badge">{categoryEmoji}</span>
            </div>
            <Progress value={progress} className="quiz-progress" />
          </Div>

          <Div className="question-section">
            <div className="friend-avatar-small">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.name} />
              ) : (
                <span>👤</span>
              )}
            </div>
            <Title level="2" className="question-text">
              {question.text}
            </Title>
          </Div>

          <Group className="answers-group">
            {question.options.map((option, idx) => (
              <Div key={idx} className="answer-div">
                <button 
                  className="answer-button"
                  onClick={() => onAnswer(idx)}
                >
                  <span className="answer-letter">
                    {['А', 'Б', 'В', 'Г'][idx]}
                  </span>
                  <span className="answer-text">{option}</span>
                </button>
              </Div>
            ))}
          </Group>
        </Group>
      </Panel>
    </View>
  );
}
