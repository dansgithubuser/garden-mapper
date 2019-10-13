export function constructIconParams(seed = false) {
  const result = {
    size: 0.02,
    segments: 2,
    split: {
      number: 2,
      numberVariance: 0,
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
  );
  const angleV = angleF + 2 * Math.PI * params.split.angle.variance * rand.next(-1, 1);
  const xf = x + params.size * Math.sin(angleV);
  const yf = y + params.size * Math.cos(angleV);
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
  return { x: xf, y: yf, angle: angleF };
}

export function renderIcon(self, x, y, params) {
  const rand = new self.math.Rand(params.seed);
  const work = [{ x, y, angle: 0, generation: 1, params }];
  var totalWork = 0;
  while (work.length) {
    const segment = work.pop();
    var splits = segment.params.split.number;
    splits += rand.nextI() % ((segment.params.split.numberVariance || 0) + 1);
    for (var split = 0; split < splits; ++split) {
      const { x, y, angle } = renderSegment(self, segment.x, segment.y, segment.angle, segment.params, rand, split);
      if (segment.generation < segment.params.segments)
        work.push({ x, y, angle, generation: segment.generation + 1, params: segment.params });
      const children = segment.params.children;
      for (const k in children)
        work.push({ x, y, angle, generation: 1, params: children[k]});
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
  asparagus: {
    "root": {
      "size": 0.05,
      "segments": 5,
      "split": {
        "number": 1,
        "angle": {
          "start": 0,
          "step": 0,
          "variance": 0.05
        },
        "numberVariance": 0
      },
      "width": 0,
      "corrugation": {
        "amplitude": 0,
        "number": 2
      },
      "seed": 1892642
    },
    "root.1": {
      "size": 0.05,
      "segments": 1,
      "split": {
        "number": 3,
        "numberVariance": 0,
        "angle": {
          "start": -0.25,
          "step": 0.25,
          "variance": 0.1
        }
      },
      "width": 0,
      "corrugation": {
        "amplitude": 0,
        "number": 2
      }
    }
  },
  blueberry: {
    "root": {
      "size": 0.1,
      "segments": 3,
      "split": {
        "number": 1,
        "angle": {
          "start": -0.05,
          "step": 0.1,
          "variance": 0.05
        },
        "numberVariance": 2
      },
      "width": 0,
      "corrugation": {
        "amplitude": 0,
        "number": 2
      },
      "seed": 1892632
    },
    "root.1": {
      "size": 0.04,
      "segments": 1,
      "split": {
        "number": 1,
        "numberVariance": 0,
        "angle": {
          "start": 0,
          "step": 0,
          "variance": 0.2
        }
      },
      "width": 0.03,
      "corrugation": {
        "amplitude": 0.1,
        "number": 2
      }
    }
  },
  cauliflower: {
    "root": {
      "size": 0,
      "segments": 1,
      "split": {
        "number": 1,
        "angle": {
          "start": 0,
          "step": 0,
          "variance": 0
        }
      },
      "width": 0,
      "corrugation": {
        "amplitude": 0,
        "number": 0
      },
      "seed": 5170206
    },
    "root.1": {
      "size": 0.03,
      "segments": 3,
      "split": {
        "number": 3,
        "angle": {
          "start": -0.2,
          "step": 0.4,
          "variance": 0.1
        }
      },
      "width": 0.03,
      "corrugation": {
        "amplitude": 0.1,
        "number": 10
      }
    },
    "root.2": {
      "size": 0.3,
      "segments": 1,
      "split": {
        "number": 12,
        "angle": {
          "start": 0,
          "step": 0.2,
          "variance": 0.1
        }
      },
      "width": 0.1,
      "corrugation": {
        "amplitude": 0.3,
        "number": 1
      }
    }
  },
  strawberry: {
    "root": {
      "size": 0.1,
      "segments": 1,
      "split": {
        "number": 5,
        "angle": {
          "start": 0,
          "step": 0.2,
          "variance": 0.05
        }
      },
      "width": 0,
      "corrugation": {
        "amplitude": 0,
        "number": 2
      },
      "seed": 7906174
    },
    "root.1": {
      "size": 0.05,
      "segments": 1,
      "split": {
        "number": 3,
        "angle": {
          "start": -0.25,
          "step": 0.25,
          "variance": 0.05
        }
      },
      "width": 0.05,
      "corrugation": {
        "amplitude": 0.1,
        "number": 10
      }
    }
  },
};
