export function chooseRandomWithWeight(options, totalWeight) {
  let r = Math.random() * totalWeight;
  for (const option of options) {
    r -= option.w;
    if (r <= 0) return option.v;
  }
  return options[options.length - 1].v;
}
