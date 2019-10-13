export function constructIconParams(seed = false) {
  const result = {
    size: 0.02,
    segments: 2,
    split: {
      number: 2,
      angle: {
        start: -0.2,
        step: 0.4,
        variance: 0.1,
      },
    },
    width: 0,
    corrugation: {
      amplitude: 0,
      number: 2,
    },
  };
  if (seed) result['seed'] = 1;
  return result;
}

function renderSegment(self, x, y, angle, params, rand, split) {
  const angleF = angle + 2 * Math.PI * (
    + params.split.angle.start
    + split * params.split.angle.step
    + params.split.angle.variance * rand.next(-1, 1)
  );
  const xf = x + params.size * Math.sin(angleF);
  const yf = y + params.size * Math.cos(angleF);
  const d = self.math.distance(x, y, xf, yf);
  const w = {
    x: -(yf - y) / d * params.width,
    y:  (xf - x) / d * params.width,
  };
  const divisions = params.corrugation.number * 5;
  const context = self.canvas.getContext('2d');
  context.fillStyle = 'white';
  context.beginPath();
  {
    const { px, py } = self.math.transformToPixels(self, { x, y });
    context.moveTo(px, py);
  }
  for (var i = 0; i < divisions; ++i) {
    const theta = (i / (divisions - 1)) * 2 * Math.PI;
    const p = (1 - Math.cos(theta)) / 2;
    const q = (    Math.sin(theta)) / 2;
    const s = 1 + params.corrugation.amplitude * Math.cos(params.corrugation.number * theta);
    const { px, py } = self.math.transformToPixels(self, {
      x: x + (p * (xf - x) + q * w.x) * s,
      y: y + (p * (yf - y) + q * w.y) * s,
    });
    context.lineTo(px, py);
  }
  context.stroke();
  context.fill();
  return { x: xf, y: yf, angle: angleF };
}

export function renderIcon(self, x, y, params) {
  const rand = new self.math.Rand(params.seed);
  const work = [{ x, y, angle: 0, generation: 1, params }];
  while (work.length) {
    const segment = work.pop();
    for (var split = 0; split < segment.params.split.number; ++split) {
      const { x, y, angle } = renderSegment(self, segment.x, segment.y, segment.angle, segment.params, rand, split);
      if (segment.generation < segment.params.segments)
        work.push({ x, y, angle, generation: segment.generation + 1, params: segment.params });
      const children = segment.params.children;
      for (const k in children)
        work.push({ x, y, angle, generation: 1, params: children[k]});
    }
  }
}

export function iconParamsFlatten(params) {
  function recurse(params, path = 'root') {
    var result = { [path]: params };
    for (const i in params.children)
      result = { ...result, ...recurse(params.children[i], path + '.' + i) };
    return result;
  }
  const result = JSON.parse(JSON.stringify(recurse(params)));
  for (const k in result) delete result[k].children;
  return result;
}

export function iconParamsNest(params) {
  const keys = Object.keys(params).sort();
  const result = { ...params['root'], children: {} };
  for (const i of keys.slice(1)) {
    var node = result;
    const split = i.split('.');
    const leaf = split.pop();
    for (const j of split.slice(1)) node = node.children[j];
    node.children[leaf] = { ...params[i], children: {} };
  }
  return JSON.parse(JSON.stringify(result));
}
