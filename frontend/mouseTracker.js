mousePosition = { x: 0, y: 0 };
mouseCellPosition = { x: 0, y: 0 };
mouseEdgePosition = { x: 0, y: 0 };

function initMouseTracker() {

    canvas.addEventListener('mousemove', function (event) {
        //console.log('cameraTranslation:', cameraTranslation);
        mouseCellPosition.x = Math.floor((event.offsetX - cameraTranslation[0]) / GRID_SIZE);
        mouseCellPosition.y = Math.floor((event.offsetY - cameraTranslation[1]) / GRID_SIZE);
        mouseEdgePosition.x = Math.round((event.offsetX - cameraTranslation[0]) / GRID_SIZE);
        mouseEdgePosition.y = Math.round((event.offsetY - cameraTranslation[1]) / GRID_SIZE);
        mousePosition.x = event.offsetX;
        mousePosition.y = event.offsetY;
    });

}