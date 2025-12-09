// Test to understand the issue
console.log("Testing update logic");

// Simulate the scenario
const existingEntry = { type: 'neutral', duration: 30, isDraft: false };
const updatedEntry = { type: 'signal', duration: 60, isDraft: false };
const entryType = 'signal';
const duration = 60;

const durationChanged = duration !== undefined && duration !== existingEntry.duration;
const typeChanged = entryType !== existingEntry.type;
const becomingFinal = existingEntry.isDraft && false === false;

console.log('durationChanged:', durationChanged);
console.log('typeChanged:', typeChanged);
console.log('becomingFinal:', becomingFinal);
console.log('shouldUpdate:', (durationChanged || typeChanged || becomingFinal) && !updatedEntry.isDraft);

// Simulate day totals
let day = { signalTotal: 100, wastedTotal: 50 };
let newSignalTotal = day.signalTotal;
let newWastedTotal = day.wastedTotal;

console.log('\nBefore:');
console.log('Signal:', newSignalTotal, 'Wasted:', newWastedTotal);

// Remove old contribution
if (!existingEntry.isDraft && existingEntry.duration) {
  if (existingEntry.type === 'signal') {
    newSignalTotal -= existingEntry.duration;
    console.log('Removed', existingEntry.duration, 'from signal');
  } else if (existingEntry.type === 'wasted') {
    newWastedTotal -= existingEntry.duration;
    console.log('Removed', existingEntry.duration, 'from wasted');
  } else {
    console.log('Entry type', existingEntry.type, 'not signal or wasted, no removal');
  }
}

// Add new contribution
if (updatedEntry.duration) {
  if (entryType === 'signal') {
    newSignalTotal += updatedEntry.duration;
    console.log('Added', updatedEntry.duration, 'to signal');
  } else if (entryType === 'wasted') {
    newWastedTotal += updatedEntry.duration;
    console.log('Added', updatedEntry.duration, 'to wasted');
  }
}

console.log('\nAfter:');
console.log('Signal:', newSignalTotal, 'Wasted:', newWastedTotal);
