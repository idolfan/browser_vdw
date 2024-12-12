let firstPoint = null;
let lastAction = null;

let levelHistory = [];
let levelHistoryIndex = 0;

function pushHistory() {
    if (levelHistoryIndex < levelHistory.length - 1) {
        levelHistory = levelHistory.slice(0, levelHistoryIndex + 1);
    }
    levelHistory.push(JSON.parse(JSON.stringify(level)));
    levelHistoryIndex = levelHistory.length - 1;
}

document.addEventListener('keydown', function (event) {
    requiresRender = true;
    //console.log('Keydown:', event);
    if (event.ctrlKey) {
        if (event.key === 's') {
            event.preventDefault();
            saveLevel();
        } else if (event.key === 'z') {
            event.preventDefault();
            if (levelHistoryIndex > 0) {
                levelHistoryIndex--;
                level = JSON.parse(JSON.stringify(levelHistory[levelHistoryIndex]));
            }
        } else if (event.key === 'y') {
            event.preventDefault();
            if (levelHistoryIndex < levelHistory.length - 1) {
                levelHistoryIndex++;
                level = JSON.parse(JSON.stringify(levelHistory[levelHistoryIndex]));
            }
        }
    } else
        if (event.key === 'w') cameraPosition[1] -= GRID_SIZE;
        else if (event.key === 'a') cameraPosition[0] -= GRID_SIZE;
        else if (event.key === 's') cameraPosition[1] += GRID_SIZE;
        else if (event.key === 'd') cameraPosition[0] += GRID_SIZE;
        else if (event.key === 'e' && lastAction !== 'wall') {
            ;
            firstPoint = { ...mouseEdgePosition };
            lastAction = 'wall';
        }
});

document.addEventListener('keyup', function (event) {
    requiresRender = true;
    if (event.key === 'e') {
        if (firstPoint && lastAction === 'wall' && previewWall) {
            /*             if(firstPoint.x === secondPoint.x && firstPoint.y === secondPoint.y || (firstPoint.x !== secondPoint.x && firstPoint.y !== secondPoint.y)) {
                            firstPoint = null;
                            lastAction = null;
                            previewWall = null;
                            return;
                        } */
            level.walls.push(previewWall);
            console.log('Adding wall:', previewWall);
            firstPoint = null;
            lastAction = null;
            previewWall = null;
            pushHistory();
        }
        firstPoint = null;
        lastAction = null;
        previewWall = null;
    }
});

document.addEventListener('mousemove', function (event) {
    if (lastAction === 'wall') {
        const secondPoint = { ...mouseEdgePosition };
        requiresRender = true;
        if (firstPoint.x !== secondPoint.x && firstPoint.y !== secondPoint.y) {
            const xDiff = Math.abs(firstPoint.x - secondPoint.x);
            const yDiff = Math.abs(firstPoint.y - secondPoint.y);

            if (xDiff > yDiff) {
                secondPoint.y = firstPoint.y;
            } else {
                secondPoint.x = firstPoint.x;
            }
        }
        previewWall = {
            x1: Math.min(firstPoint.x, secondPoint.x),
            y1: Math.min(firstPoint.y, secondPoint.y),
            x2: Math.max(firstPoint.x, secondPoint.x),
            y2: Math.max(firstPoint.y, secondPoint.y),
        }

    }
});

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    requiresRender = true;
    previewWall = null;
    lastAction = null;
    firstPoint = null;
});
