const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// Generate a random GitHub username
const generateGitHubUsername = () => {
  return faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Generate a random project
const generateProject = () => {
  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'Go', 'Rust'];
  const frameworks = ['React', 'Vue.js', 'Angular', 'Django', 'Flask', 'Spring', 'Express', 'Laravel'];
  
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    technologies: faker.helpers.arrayElements(languages, faker.number.int({ min: 1, max: 4 })),
    frameworks: faker.helpers.arrayElements(frameworks, faker.number.int({ min: 0, max: 2 })),
    githubUrl: `https://github.com/${generateGitHubUsername()}/${faker.helpers.slugify(faker.commerce.productName())}`,
    demoUrl: faker.internet.url(),
    imageUrl: faker.image.urlLoremFlickr({ category: 'technology' }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
};

// Generate a fake user
const generateUser = () => {
  const username = generateGitHubUsername();
  return {
    id: faker.string.uuid(),
    username: username,
    email: faker.internet.email(),
    password: faker.internet.password(),
    fullName: faker.person.fullName(),
    bio: faker.lorem.paragraph(),
    location: faker.location.city(),
    githubUrl: `https://github.com/${username}`,
    avatarUrl: faker.image.avatar(),
    projects: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, generateProject),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
};

// Generate multiple users
const generateUsers = (count) => {
  return Array.from({ length: count }, generateUser);
};

// Generate the data
const fakeData = {
  users: generateUsers(10) // Generate 10 users
};

// Write to db.json
const dbPath = path.join(__dirname, '../../db.json');
fs.writeFileSync(dbPath, JSON.stringify(fakeData, null, 2));

console.log('Generated fake data successfully!'); 