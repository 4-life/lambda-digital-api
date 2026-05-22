import { faker } from '@faker-js/faker';
import { Items } from './entities/Items';

const avatars = [
  '01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp',
  '07.webp', '08.webp', '09.webp', '10.webp', '11.webp',
];

const pics = [
  '1e54778d-a939-4f0a-9acb-134b69007c25.webp',
  '8ed4b930-5830-4de5-818c-7ab06314746c.webp',
  '9e668765-5414-4993-a956-99930b3791d7.webp',
  '45f68c2a-101c-456d-a736-b808d7f930a8.webp',
  '709e6ebf-1ecc-4a6d-b1c7-9f2072b3c01f.webp',
  '04314f8b-6c8d-41c5-95be-e78848eee6e1.webp',
  '5914ae6c-0510-4456-9979-dca86f9b7f55.webp',
  'a82e12b9-de17-4b40-8ca3-5c67fd9d23a9.webp',
  'be31b615-5cf3-4939-96aa-78bb880fae87.webp',
  'd3f8ab56-e172-46ad-9332-cbddc6bbe96f.webp',
  'e6590b08-12d4-42f6-8540-af88677e1387.webp',
];

const data: Items[] = pics.map((pic, i) => ({
  id: faker.string.uuid(),
  title: `#${faker.number.int({ min: 1, max: 9999 })} ${faker.word.adjective()} ${faker.word.noun()}`,
  author: {
    id: faker.string.uuid(),
    name: faker.internet.username(),
    avatar: avatars[i % avatars.length],
  },
  pic,
  views: faker.number.int({ min: 10, max: 50_000 }),
  likes: faker.number.int({ min: 0, max: 1_000 }),
  comments: faker.number.int({ min: 0, max: 2_000 }),
  price: faker.number.float({ min: 0.001, max: 10, fractionDigits: 3 }).toFixed(3),
  publishDate: faker.date.recent({ days: 365 }),
})).sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

export default data;
