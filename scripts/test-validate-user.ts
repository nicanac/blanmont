import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Ensure we are in "server" mode
// (Node.js is naturally window === undefined, but just to be sure)
if (typeof window !== 'undefined') {
  throw new Error('This script must run in Node.js');
}

async function run() {
  console.log('--- Test Validate User (Server) ---');
  const { validateUser } = await import('../app/lib/firebase/members');

  const email = 'bruyere.nicolas@gmail.com';
  const password = '__AA0436aa__';

  try {
    const member = await validateUser(email, password);
    console.log('\nRESULT:');
    if (member) {
      console.log('User Validated Successfully!');
      console.log('Name:', member.name);
      console.log('Role:', member.role);
    } else {
      console.log('User validation FAILED (returned null).');
    }
  } catch (error) {
    console.error('Script Error:', error);
  }
}

run();
