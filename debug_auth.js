const middleware = require('./backend/middleware/auth');
console.log('--- DEBUG START ---');
console.log('Full Exports Object:', middleware);
console.log('Type of exports:', typeof middleware);

const { auth } = middleware;
console.log('Type of auth:', typeof auth);
console.log('Is auth a function?', typeof auth === 'function');
console.log('--- DEBUG END ---');
