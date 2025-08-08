import assert from 'node:assert/strict';

async function main() {
  // Provide a dummy database URL so prisma import doesn't throw
  process.env.DATABASE_URL = 'file:./test.db';

  const { getEndOfWeek } = await import('../src/lib/utils/noticeUtils');

  // Test that getEndOfWeek returns the same day when called on Sunday
  {
    const sunday = new Date('2024-09-15T10:00:00Z'); // Sunday
    const end = getEndOfWeek(sunday);
    assert.equal(end.getUTCFullYear(), 2024);
    assert.equal(end.getUTCMonth(), 8); // September (0-indexed)
    assert.equal(end.getUTCDate(), 15); // Same day
    assert.equal(end.getUTCHours(), 23);
    assert.equal(end.getUTCMinutes(), 59);
    assert.equal(end.getUTCSeconds(), 59);
    assert.equal(end.getUTCMilliseconds(), 999);
  }

  // Test that getEndOfWeek returns upcoming Sunday for Wednesday
  {
    const wednesday = new Date('2024-09-18T12:00:00Z'); // Wednesday
    const end = getEndOfWeek(wednesday);
    assert.equal(end.toISOString(), '2024-09-22T23:59:59.999Z');
  }

  console.log('getEndOfWeek tests passed');
}

main();
