document.getElementById('simulateButton').addEventListener('click', simulatePropagation);

function simulatePropagation() {
    const numPeers = parseInt(document.getElementById('numPeers').value);
    const totalMiningPeers = parseInt(document.getElementById('miningPeers').value);
    const refusalRate = parseInt(document.getElementById('refusalRate').value) / 100;
    const numSimulations = parseInt(document.getElementById('numSimulations').value);
    const resultsTableBody = document.getElementById('resultsTable').querySelector('tbody');
    
    // Clear previous results
    resultsTableBody.innerHTML = '';

    let propagationFailures = 0;

    for (let simulation = 1; simulation <= numSimulations; simulation++) {
        // Create peers and their connections
        const peers = Array.from({ length: numPeers }, (_, index) => ({
            id: index,
            connections: [],
            willRelay: Math.random() > refusalRate,
            isMiningPeer: false // Initialize mining peer status
        }));

        // Randomly designate mining peers
        const miningPeerIndices = new Set();
        while (miningPeerIndices.size < Math.min(totalMiningPeers, numPeers)) {
            miningPeerIndices.add(Math.floor(Math.random() * numPeers));
        }

        miningPeerIndices.forEach(index => {
            peers[index].isMiningPeer = true; // Mark as mining peer
        });

        // Connect peers randomly
        for (let peer of peers) {
            const numConnections = Math.floor(Math.random() * 4) + 5; // 5 to 8 connections
            const connectedPeers = new Set();

            while (connectedPeers.size < numConnections) {
                const randomPeer = Math.floor(Math.random() * numPeers);
                if (randomPeer !== peer.id) {
                    connectedPeers.add(randomPeer);
                }
            }

            peer.connections = Array.from(connectedPeers);
        }

        // Start message propagation from random peer
        const initialPeer = Math.floor(Math.random() * numPeers);
        const visited = new Set();
        const queue = [...peers[initialPeer].connections];

        while (queue.length > 0) {
            const currentPeer = queue.shift();
            if (visited.has(currentPeer)) continue;
            visited.add(currentPeer);

            if (peers[currentPeer].willRelay) {
                for (const neighbor of peers[currentPeer].connections) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }
        }

        // Calculate the propagation percentage
        const propagationPercentage = (visited.size / numPeers) * 100;

        // Check if any mining peer has received the message
        const miningPeersReceived = [...miningPeerIndices].some(index => visited.has(index));

        // Add result to the table
        const row = resultsTableBody.insertRow();
        const cellSimulation = row.insertCell(0);
        const cellPercentage = row.insertCell(1);
        const cellResult = row.insertCell(2);

        cellSimulation.textContent = simulation;
        cellPercentage.textContent = propagationPercentage.toFixed(2);

        // Determine success or fail
        if (miningPeersReceived) {
            cellResult.textContent = 'Success';
            cellResult.style.color = 'green';
        } else {
            cellResult.textContent = 'Fail';
            cellResult.style.color = 'red';
            propagationFailures++;
        }
    }

    // Calculate filter success rate
    const filterSuccessRate = (propagationFailures / numSimulations) * 100;
    const filterSuccessElement = document.getElementById('filterSuccessRate');
    filterSuccessElement.textContent = `Filter success rate: ${filterSuccessRate.toFixed(2)}%`;

}
