export function constructIconParams(seed = false) {
  const result = {
    size: 0.02,
    sizeStep: 0,
    sizeVariance: 0,
    segments: 2,
    split: {
      number: 2,
      numberVariance: 0,
      angle: {
        start: -0.1,
        step: 0.2,
        variance: 0.05,
        toward: 0,
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

function renderSegment(self, x, y, angle, size, params, rand, split) {
  var sign = 1;
  if (params.split.angle.toward) {
    let a = angle / (2 * Math.PI);
    a = a - Math.floor(a);
    let t = params.split.angle.toward;
    t = t - Math.floor(t);
    let d = (a - t);
    d = d - Math.floor(d);
    if (d < 0.5) sign = -1;
  }
  var angleF = angle + sign * 2 * Math.PI * (
    + params.split.angle.start
    + split * params.split.angle.step
  );
  var r = rand.next(-1, 1);
  if (params.split.angle.toward && (sign > 0) == (r < 0)) r *= -1;
  const angleV = angleF + 2 * Math.PI * params.split.angle.variance * r;
  const sizeF = size + (params.sizeStep || 0);
  const sizeV = sizeF + (params.sizeVariance || 0) * rand.next();
  const xf = x + sizeV * Math.sin(angleV);
  const yf = y + sizeV * Math.cos(angleV);
  const d = self.math.distance(x, y, xf, yf);
  const w = {
    x: -(yf - y) / d * params.width,
    y:  (xf - x) / d * params.width,
  };
  const divisions = Math.min(params.corrugation.number * 5 + 8, 40);
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
  return { x: xf, y: yf, angle: angleV, size: sizeF };
}

export function renderIcon(self, x, y, params) {
  const rand = new self.math.Rand(params.seed);
  const work = [{
    x, y,
    angle: 0,
    size: params.size,
    generation: 1,
    params,
  }];
  var totalWork = 0;
  while (work.length) {
    const segment = work.pop();
    var splits = segment.params.split.number;
    splits += rand.nextI() % ((segment.params.split.numberVariance || 0) + 1);
    for (var split = 0; split < splits; ++split) {
      const {
        x, y,
        angle,
        size,
      } = renderSegment(self,
        segment.x, segment.y,
        segment.angle,
        segment.size,
        segment.params, rand, split,
      );
      if (segment.generation < segment.params.segments) work.push({
        x, y,
        angle,
        size,
        generation: segment.generation + 1,
        params: segment.params,
      });
      const children = segment.params.children;
      for (const k in children) work.push({
        x, y,
        angle,
        size: children[k].size,
        generation: 1,
        params: children[k],
      });
    }
    ++totalWork;
    if (totalWork>40) break;
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

export const iconParams = {
  artichoke: {"root":{"size":0.01,"segments":1,"split":{"number":5,"angle":{"start":0,"step":0,"variance":0.25},"numberVariance":0},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":11009849,"sizeVariance":0.005},"root.1":{"size":0.5,"sizeStep":0,"sizeVariance":0.2,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.05,"toward":0}},"width":0.2,"corrugation":{"amplitude":0.5,"number":10}}},
  asparagus: {"root":{"size":0.05,"segments":5,"split":{"number":1,"angle":{"start":0,"step":0,"variance":0.05},"numberVariance":0},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":972349},"root.1":{"size":0.05,"segments":1,"split":{"number":3,"numberVariance":0,"angle":{"start":-0.25,"step":0.25,"variance":0.1}},"width":0,"corrugation":{"amplitude":0,"number":2}}},
  bean: {"root":{"size":0.2,"segments":3,"split":{"number":1,"numberVariance":1,"angle":{"start":0,"step":0,"variance":0.1,"toward":0.01}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":16303992,"sizeVariance":0.05},"root.1":{"size":0.07,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.15,"toward":0}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":3,"numberVariance":0,"angle":{"start":-0.25,"step":0.25,"variance":0,"toward":0}},"width":0.03,"corrugation":{"amplitude":0.03,"number":6}}},
  blueberry: {"root":{"size":0.1,"segments":3,"split":{"number":1,"angle":{"start":-0.05,"step":0.1,"variance":0.05},"numberVariance":2},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":704705},"root.1":{"size":0.04,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.2}},"width":0.03,"corrugation":{"amplitude":0.1,"number":2}}},
  cauliflower: {"root":{"size":0,"segments":1,"split":{"number":1,"angle":{"start":0,"step":0,"variance":0}},"width":0,"corrugation":{"amplitude":0,"number":0},"seed":15097425},"root.1":{"size":0.03,"segments":3,"split":{"number":3,"angle":{"start":-0.2,"step":0.4,"variance":0.1}},"width":0.03,"corrugation":{"amplitude":0.1,"number":10}},"root.2":{"size":0.3,"segments":1,"split":{"number":12,"angle":{"start":0,"step":0.2,"variance":0.1}},"width":0.1,"corrugation":{"amplitude":0.3,"number":1}}},
  corn: {"root":{"size":0.2,"segments":4,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.01}},"width":0.005,"corrugation":{"amplitude":0,"number":2},"seed":749801},"root.1":{"size":0.3,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0}},"width":0.01,"corrugation":{"amplitude":0,"number":2}},"root.2":{"size":0.1,"segments":1,"split":{"number":2,"numberVariance":0,"angle":{"start":-0.15,"step":0.3,"variance":0.1}},"width":0.005,"corrugation":{"amplitude":0,"number":2}},"root.2.3":{"size":0.1,"segments":2,"split":{"number":1,"numberVariance":0,"angle":{"start":-0.2,"step":0.4,"variance":0.1,"toward":0.01}},"width":0.005,"corrugation":{"amplitude":0,"number":2}}},
  cucumber: {"root":{"size":0.2,"segments":5,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.1}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":3967192,"sizeVariance":0.05},"root.1":{"size":0.1,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.2,"toward":0}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.1,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0,"toward":0}},"width":0.1,"corrugation":{"amplitude":0.05,"number":6}}},
  dandelion: {"root":{"size":0.01,"segments":1,"split":{"number":20,"angle":{"start":0,"step":0,"variance":0.25},"numberVariance":0},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":15375734,"sizeVariance":0.005},"root.1":{"size":0.2,"sizeStep":0,"sizeVariance":0.2,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.05,"toward":0}},"width":0.05,"corrugation":{"amplitude":0.5,"number":10}}},
  dill: {"root":{"size":0.01,"segments":1,"split":{"number":1,"angle":{"start":0,"step":0,"variance":0.1,"toward":0.001},"numberVariance":1},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":5746698,"sizeVariance":0.005},"root.1":{"size":0.2,"sizeStep":0,"sizeVariance":0.1,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.05,"toward":0.001}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":-0.02,"sizeVariance":0.01,"segments":2,"split":{"number":8,"numberVariance":0,"angle":{"start":0,"step":0.22,"variance":0.2,"toward":0.001}},"width":0,"corrugation":{"amplitude":0,"number":2}}},
  garlic: {"root":{"size":0.01,"segments":2,"split":{"number":1,"angle":{"start":0,"step":0,"variance":0.1,"toward":0.001},"numberVariance":1},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":110817,"sizeVariance":0.005},"root.1":{"size":0.01,"sizeStep":0,"sizeVariance":0.2,"segments":3,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.05,"toward":0.001}},"width":0.005,"corrugation":{"amplitude":0,"number":2}}},
  haskap: {"root":{"size":0.1,"segments":2,"split":{"number":2,"numberVariance":0,"angle":{"start":0,"step":-0.15,"variance":0.3,"toward":0.01}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":1398,"sizeVariance":0.05},"root.1":{"size":0.07,"sizeStep":0,"sizeVariance":0,"segments":3,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.15,"toward":0.001}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":2,"numberVariance":0,"angle":{"start":-0.25,"step":0.5,"variance":0,"toward":0}},"width":0.03,"corrugation":{"amplitude":0.03,"number":6}}},
  'lemon balm': {"root":{"size":0,"segments":1,"split":{"number":4,"numberVariance":0.2,"angle":{"start":0,"step":0,"variance":0.5,"toward":""}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":2111631,"sizeVariance":0.05},"root.1":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":4,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.25,"toward":0.01}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":4,"numberVariance":0,"angle":{"start":0,"step":0.25,"variance":0,"toward":0}},"width":0.03,"corrugation":{"amplitude":0.15,"number":20}}},
  mint: {"root":{"size":0,"segments":1,"split":{"number":4,"numberVariance":0.2,"angle":{"start":0,"step":0,"variance":0.5,"toward":""}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":10866469,"sizeVariance":0.05},"root.1":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":4,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.25,"toward":0.01}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":4,"numberVariance":0,"angle":{"start":0,"step":0.25,"variance":0,"toward":0}},"width":0.03,"corrugation":{"amplitude":0.03,"number":6}}},
  raspberry: {"root":{"size":0,"segments":1,"split":{"number":5,"numberVariance":0,"angle":{"start":0,"step":0.2,"variance":0}},"width":0,"corrugation":{"amplitude":0,"number":0},"seed":10839999},"root.1":{"size":0.05,"segments":4,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.1,"toward":0}},"width":0,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.25,"toward":0}},"width":0.05,"corrugation":{"amplitude":0.1,"number":5}}},
  rhubarb: {"root":{"size":0.2,"segments":1,"split":{"number":7,"angle":{"start":0,"step":0.14,"variance":0.07}},"width":0.02,"corrugation":{"amplitude":0,"number":0},"seed":4362961,"sizeVariance":0.1},"root.1":{"size":0.2,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0,"toward":0}},"width":0.2,"corrugation":{"amplitude":0.07,"number":10}}},
  sage: {"root":{"size":0.05,"segments":3,"split":{"number":1,"angle":{"start":0,"step":0,"variance":0.1},"numberVariance":1},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":9353382,"sizeVariance":0.1},"root.1":{"size":0.07,"segments":1,"split":{"number":3,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.1}},"width":0.03,"corrugation":{"amplitude":0.1,"number":2},"sizeVariance":0.05}},
  strawberry: {"root":{"size":0.1,"segments":1,"split":{"number":5,"angle":{"start":0,"step":0.2,"variance":0.05}},"width":0,"corrugation":{"amplitude":0,"number":2},"seed":15857556},"root.1":{"size":0.05,"segments":1,"split":{"number":3,"angle":{"start":-0.25,"step":0.25,"variance":0.05}},"width":0.05,"corrugation":{"amplitude":0.1,"number":10}}},
  tomato: {"root":{"size":0.2,"segments":3,"split":{"number":1,"numberVariance":0.2,"angle":{"start":0,"step":0,"variance":0.1,"toward":0.01}},"width":0.005,"corrugation":{"amplitude":0,"number":0},"seed":2085650,"sizeVariance":0.05},"root.1":{"size":0.07,"sizeStep":0,"sizeVariance":0,"segments":4,"split":{"number":1,"numberVariance":0,"angle":{"start":0,"step":0,"variance":0.15,"toward":0}},"width":0.003,"corrugation":{"amplitude":0,"number":2}},"root.1.2":{"size":0.05,"sizeStep":0,"sizeVariance":0,"segments":1,"split":{"number":2,"numberVariance":0,"angle":{"start":-0.25,"step":0.5,"variance":0,"toward":0}},"width":0.03,"corrugation":{"amplitude":0.03,"number":6}}},
};
