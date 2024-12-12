let cameraPosition = [0, 0];
let offset = [0, 0];
const GRID_SIZE = 50;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let requiresRender = true;
previousMouseCellPosition = { x: 0, y: 0 };
previousMouseEdgePosition = { x: 0, y: 0 };
let cameraTranslation = [0, 0];

let previewWall = null;

function getShadowPolygon(points, observerPos) {
    const [point1, point2] = points;
    const vector1 = [point1[0] - observerPos[0], point1[1] - observerPos[1]];
    const vector2 = [point2[0] - observerPos[0], point2[1] - observerPos[1]];

    // Projizieren der Punkte ins Unendliche
    const farPoint1 = [point1[0] + vector1[0] * 1000, point1[1] + vector1[1] * 1000];
    const farPoint2 = [point2[0] + vector2[0] * 1000, point2[1] + vector2[1] * 1000];

    return [point1, point2, farPoint2, farPoint1];
}

function render() {
    /* canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d'); */
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!level) return;

    console.log('Rendering');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const player = Object.values(players)[0]; // Annahme: Wir nehmen den ersten Spieler als Kamera-Referenz
    if (player) cameraPosition = [player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2];

    const leftCameraEdge = Math.floor((cameraPosition[0] - WIDTH / 2) / GRID_SIZE) - 1;
    const rightCameraEdge = Math.ceil((cameraPosition[0] + WIDTH / 2) / GRID_SIZE) + 1;
    const topCameraEdge = Math.floor((cameraPosition[1] - HEIGHT / 2) / GRID_SIZE) - 1;
    const bottomCameraEdge = Math.ceil((cameraPosition[1] + HEIGHT / 2) / GRID_SIZE) + 1;


    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Übersetzung der Kamera
    cameraTranslation = [-cameraPosition[0] + WIDTH / 2, -cameraPosition[1] + HEIGHT / 2];

    offset = [(cameraPosition[0] - WIDTH / 2) % GRID_SIZE + GRID_SIZE,
    (cameraPosition[1] - HEIGHT / 2) % GRID_SIZE + GRID_SIZE];

    ctx.translate(-offset[0], -offset[1]);

    // Gitter zeichnen (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < WIDTH + GRID_SIZE * 2; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT + GRID_SIZE * 2);
        ctx.stroke();
    }
    for (let y = 0; y < HEIGHT + GRID_SIZE * 2; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH + GRID_SIZE * 2, y);
        ctx.stroke();
    }

    ctx.translate(offset[0], offset[1]);

    ctx.translate(cameraTranslation[0], cameraTranslation[1]);

    // Zeichnen von Wänden (horizontal und vertikal)
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    const wallThickness = 4;
    for (let wall of level.walls) { // Standardfarbe der Wände
        let xBonus;
        let yBonus;
        if (wall.x1 === wall.x2) {
            yBonus = 0;
            xBonus = wallThickness;
        } else {
            yBonus = wallThickness;
            xBonus = 0;
        }

        ctx.fillRect(
            wall.x1 * GRID_SIZE - xBonus / 2,
            wall.y1 * GRID_SIZE - yBonus / 2,
            (wall.x2 - wall.x1) * GRID_SIZE + xBonus,
            (wall.y2 - wall.y1) * GRID_SIZE + yBonus
        );
    }

    // Spieler zeichnen
    for (const playerId in players) {
        const player = players[playerId];
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Schattenwurf (Beispiel für einfache Schattenprojektion)
    const observerPos = [cameraPosition[0] / GRID_SIZE, cameraPosition[1] / GRID_SIZE];
    const polygons = [];
    for (let wall of level.walls) {
        const polygon = getShadowPolygon([[wall.x1, wall.y1], [wall.x2, wall.y2]], observerPos);
        if (polygon) polygons.push(polygon);
    }
    //console.log(polygons);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    for (let polygon of polygons) {
        ctx.beginPath();
        ctx.moveTo(polygon[0][0] * GRID_SIZE, polygon[0][1] * GRID_SIZE);
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i][0] * GRID_SIZE, polygon[i][1] * GRID_SIZE);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Preview-Wand zeichnen
    if (previewWall) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(
            previewWall.x1 * GRID_SIZE - 2 / 2,
            previewWall.y1 * GRID_SIZE - 2 / 2,
            (previewWall.x2 - previewWall.x1) * GRID_SIZE + 2,
            (previewWall.y2 - previewWall.y1) * GRID_SIZE + 2
        );
    }

    // Zurückübersetzen der Kamera
    ctx.translate(-cameraTranslation[0], -cameraTranslation[1]);

}

function renderContinuously() {
    // Highlight grid cell under mouse
    //console.log('Rendering continiously');

    const mouseCellPositionChanged = mouseCellPosition.x !== previousMouseCellPosition.x || mouseCellPosition.y !== previousMouseCellPosition.y;
    const mouseEdgePositionChanged = mouseEdgePosition.x !== previousMouseEdgePosition.x || mouseEdgePosition.y !== previousMouseEdgePosition.y;

    if (!mouseCellPositionChanged && !mouseEdgePositionChanged && !requiresRender) return;

    previousMouseCellPosition.x = mouseCellPosition.x;
    previousMouseCellPosition.y = mouseCellPosition.y;
    previousMouseEdgePosition.x = mouseEdgePosition.x;
    previousMouseEdgePosition.y = mouseEdgePosition.y;

    requiresRender = false;
    render();
    // ctx.translate(-offset[0], -offset[1]);
    ctx.translate(cameraTranslation[0], cameraTranslation[1]);

    if (!previewWall) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(mouseCellPosition.x * GRID_SIZE, mouseCellPosition.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
    ctx.strokeRect(mouseEdgePosition.x * GRID_SIZE - 1, mouseEdgePosition.y * GRID_SIZE - 1, 2, 2);
    ctx.translate(-cameraTranslation[0], -cameraTranslation[1]);
    // ctx.translate(offset[0], offset[1]);
}


function receiveGameData(message) {
    if (window.location.pathname !== '/') return;
    level = message.level
    players = message.players;
    playerId = Object.keys(players)[0];
    requiresRender = true;
}