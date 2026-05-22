import { faker } from '@faker-js/faker';
import { Items } from './entities/Items';

const avatars = [
  '01.webp',
  '02.webp',
  '03.webp',
  '04.webp',
  '05.webp',
  '06.webp',
  '07.webp',
  '08.webp',
  '09.webp',
  '10.webp',
  '11.webp',
  '12.webp',
];

const pics = [
  '01.webp',
  '02.webp',
  '03.webp',
  '04.webp',
  '05.webp',
  '06.webp',
  '07.webp',
  '08.webp',
  '09.webp',
  '10.webp',
  '11.webp',
  '12.webp',
];

const authors = avatars.map(avatar => ({
  id: faker.string.uuid(),
  name: faker.internet.username(),
  avatar,
}));

const COUNT = 100;

const data: Items[] = Array.from({ length: COUNT }, (_, i) => ({
  id: faker.string.uuid(),
  title: `#${faker.number.int({ min: 1, max: 9999 })} ${faker.word.adjective()} ${faker.word.noun()}`,
  author: authors[i % authors.length],
  pic: pics[i % pics.length],
  views: faker.number.int({ min: 10, max: 50_000 }),
  likes: faker.number.int({ min: 0, max: 1_000 }),
  comments: faker.number.int({ min: 0, max: 2_000 }),
  price: faker.number.float({ min: 0.001, max: 10, fractionDigits: 3 }).toFixed(3),
  publishDate: faker.date.recent({ days: 365 }),
})).sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

export default data;
