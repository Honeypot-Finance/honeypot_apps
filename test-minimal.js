// Minimal test to isolate the formatVolume issue
const formatVolume = (volume) => {
  const value = volume;
  console.log('Input value:', value);
  console.log('Type of value:', typeof value);
  
  if (value >= 1000000000) {
    const result = `${(value / 1000000000).toFixed(2)}B`;
    console.log('Billion result:', result);
    return result;
  } else if (value >= 1000000) {
    const result = `${(value / 1000000).toFixed(2)}M`;
    console.log('Million result:', result);
    return result;
  } else if (value >= 1000) {
    const result = `${(value / 1000).toFixed(2)}K`;
    console.log('Thousand result:', result);
    return result;
  }

  const result = `${value.toFixed(2)}`;
  console.log('Default result:', result);
  return result;
};

console.log('=== Testing formatVolume ===');
console.log('formatVolume(1000000000):', formatVolume(1000000000));
console.log('formatVolume(1000000):', formatVolume(1000000));
console.log('formatVolume(1000):', formatVolume(1000));
console.log('formatVolume(999):', formatVolume(999));

// Test toFixed directly
console.log('\n=== Testing toFixed directly ===');
console.log('(1000000000 / 1000000000).toFixed(2):', (1000000000 / 1000000000).toFixed(2));
console.log('Number.prototype.toFixed:', Number.prototype.toFixed);

// Test locale
console.log('\n=== Testing locale ===');
console.log('Locale:', Intl.NumberFormat().resolvedOptions().locale);
console.log('(1000).toLocaleString():', (1000).toLocaleString());