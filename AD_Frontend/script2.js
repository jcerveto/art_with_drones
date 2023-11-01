// script2.js
const socket = io();

socket.on('map', (mapData) => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas celdas

    mapData.map.forEach((cell) => {
        const newCell = document.createElement('div');
        newCell.className = 'cell';
        newCell.textContent = cell.status;
        mapContainer.appendChild(newCell);
    });
});
