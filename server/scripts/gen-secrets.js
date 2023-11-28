import { randomBytes } from 'crypto';

/**
 * @returns {string}
 */
function generateSecret () {
  return randomBytes(32).toString('hex');
}

console.log('COOKIE_SECRET=' + generateSecret());
console.log('SESSION_SECRET=' + generateSecret());
console.log('MONGOSTORE_SECRET=' + generateSecret());
