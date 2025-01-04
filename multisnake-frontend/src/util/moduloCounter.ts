/**
 * This function can be used to generate repeating number sequences in the range of
 * 0 to mod - 1
 * @param mod This determines the period of the sequence.
 *    If mod is 5, moduloCounter will yield the values of the set N5.
 */
export default function moduloCounter(mod: number) {
  let count = 0;
  return () => (count++ % mod);
}
