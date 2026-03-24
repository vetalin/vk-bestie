import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 0,
    text: 'Какую еду этот человек закажет в ресторане?',
    options: ['Стейк с кровью', 'Веганский салат', 'ПиццаPepperoni', 'Суши'],
    correctAnswer: 2,
    category: 'food',
  },
  {
    id: 1,
    text: 'Если бы этот человек выиграл в лотерею, что бы он сделал в первую очередь?',
    options: ['Купил квартиру', 'Отправился в путешествие', 'Купил новый телефон', 'Положил на счёт'],
    correctAnswer: 1,
    category: 'stories',
  },
  {
    id: 2,
    text: 'Этот человек утром или вечером?',
    options: ['Жаворонок — встаёт рано', 'Сова — ложится поздно', 'Хаотично', 'Оба одинаково'],
    correctAnswer: 1,
    category: 'habits',
  },
  {
    id: 3,
    text: 'Какой жанр фильма этот человек предпочитает?',
    options: ['Комедия', 'Документальный', 'Ужасы', 'Фэнтези'],
    correctAnswer: 0,
    category: 'fun',
  },
  {
    id: 4,
    text: 'Этот человек скорее...',
    options: ['Планирует заранее', 'Действует спонтанно', 'Зависит от настроения', 'Никогда не планирует'],
    correctAnswer: 2,
    category: 'habits',
  },
  {
    id: 5,
    text: 'Какой кофе этот человек закажет?',
    options: ['Американо', 'Латте с сиропом', 'Капучино', 'Не пьёт кофе'],
    correctAnswer: 1,
    category: 'food',
  },
  {
    id: 6,
    text: 'Если этот человек опоздает на встречу, сколько минут?',
    options: ['0-5 минут', '5-15 минут', '15-30 минут', 'Более 30 минут'],
    correctAnswer: 1,
    category: 'habits',
  },
  {
    id: 7,
    text: 'Какое хобби у этого человека?',
    options: ['Спорт', 'Гейминг', 'Музыка', 'Чтение'],
    correctAnswer: 2,
    category: 'fun',
  },
];

export function getQuestions(): Question[] {
  return questions;
}
