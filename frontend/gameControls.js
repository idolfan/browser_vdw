// Add listener to w a s d
document.addEventListener('keydown', function (event) {
    if (event.key === 'w') send({ type: 'movePlayer', direction: { x: 0, y: -1 }, playerId });
    if (event.key === 'a') send({ type: 'movePlayer', direction: { x: -1, y: 0 }, playerId });
    if (event.key === 's') send({ type: 'movePlayer', direction: { x: 0, y: 1 }, playerId });
    if (event.key === 'd') send({ type: 'movePlayer', direction: { x: 1, y: 0 }, playerId });
});