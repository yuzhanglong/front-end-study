const base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

const VLQ_BASE_SHIFT = 5;

// binary: 100000
const VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
const VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
const VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
function base64VLQ_encode(aValue) {
  let encoded = '';
  let digit;

  let vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
}

console.log(base64VLQ_encode(16));
