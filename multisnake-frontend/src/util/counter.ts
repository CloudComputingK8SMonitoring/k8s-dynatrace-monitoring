/**
 * This function can be used to produce the natural numbers.
 */
export default function counter() {
  let x = 0;
  return () => x++;
}
