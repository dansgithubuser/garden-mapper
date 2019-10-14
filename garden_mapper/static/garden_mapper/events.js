export function onWheel(self, x, y, dWheel) {
  const factor = 1.1;
  self.zoom *= (dWheel < 0) ? factor : 1 / factor;
  self.render();
}

export function onDrag(self, touches, dx, dy, dSize, dTheta, { sizeI }) {
  switch (touches.length) {
    case 1:
      self.x -= dx / self.zoom;
      self.y += dy / self.zoom;
      break;
    case 2:
      if (!sizeI) break;
      self.zoom *= (sizeI + dSize) / sizeI;
      break;
  }
  self.render();
}

export function onTap(self, id, x, y) {
  const world = self.math.transformToWorld(self, { x, y });
  const round = {
    x: Math.round(world.x * 1000) / 1000,
    y: Math.round(world.y * 1000) / 1000,
  };
  switch (self.visualMode) {
    case 'select':
      const getNear = (array, x, y) => {
        const potentials = [];
        for (const i of array) {
          const location = self.math.transformToPixels(self, i);
          if (self.math.distance(location.px, location.py, x, y) < 20)
            potentials.push(i);
        }
        return self.obvious.randomElement(potentials);
      }
      var near;
      switch (self.visualSubject) {
        case 'reference': {
          near = getNear(self.references, x, y);
          break;
        }
        case 'context': {
          near = getNear(
            self.context.reduce((r, i) => {
              switch (i.instructions.op) {
                case 'lines':
                  for (const j of i.instructions.points)
                    r.push({ x: j.x, y: j.y, id: i.id });
                  return r;
              }
            }, []),
            x, y,
          );
          break;
        }
        case 'plant': {
          near = getNear(
            self.plants.reduce((r, i) => {
              const { x, y, icon_params } = self.plantObservation(i);
              r.push({ x, y, id: i.id, icon_params, plant: i });
              return r;
            }, []),
            x, y,
          );
          if (near) {
            self.plantObserveName = near.plant.name;
            self.plantObserveX = near.x;
            self.plantObserveY = near.y;
            self.plantObserveIconParams = self.icon.iconParamsFlatten(near.icon_params);
          }
          break;
        }
      }
      self.selected = near;
      break;
    case 'create':
      function mark() {
        self.markers.push(world);
        self.render();
      }
      switch (self.visualSubject) {
        case 'reference':
          if (!self.referenceCreateName) return;
          self.referenceCreateX = round.x;
          self.referenceCreateY = round.y;
          mark();
          self.referenceCreate();
          break;
        case 'context':
          if (!self.contextI) {
            self.contextI = round;
          } else {
            mark();
            self.post('/context_create', {
              garden: self.gardenId,
              instructions: JSON.stringify({
                op: 'lines',
                points: [self.contextI, round],
              }),
            }).then(() => self.gardenDetails());
            self.contextI = null;
          }
          break;
        case 'plant':
          if (!self.plantObserveName) return;
          self.plantObserveX = round.x;
          self.plantObserveY = round.y;
          mark();
          self.plantObserve();
          break;
      }
  }// switch (self.visualMode)
}
