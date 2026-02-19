document.addEventListener('DOMContentLoaded', () => {

    // --- SEARCH ---
    const searchInput = document.querySelector('.toolbar input[type="text"]');
    const resourceCards = document.querySelectorAll('.resource-card');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        resourceCards.forEach(card => {
            const name = card.querySelector('.resource-name').textContent.toLowerCase();
            const detail = card.querySelector('.resource-detail').textContent.toLowerCase();

            if (name.includes(searchTerm) || detail.includes(searchTerm)) {
                card.style.display = 'flex'; // Resource card is flex
            } else {
                card.style.display = 'none';
            }
        });
    });

    // --- FILTER ---
    const statusSelect = document.querySelector('.toolbar select');

    statusSelect.addEventListener('change', (e) => {
        const filter = e.target.value; // Todos, Disponibles, Ocupados, En Mantenimiento

        resourceCards.forEach(card => {
            const badgeText = card.querySelector('.status-badge').textContent;

            // Map text to values
            let show = false;
            if (filter === 'Todos') show = true;
            else if (filter === 'Disponibles' && badgeText === 'Disponible') show = true;
            else if (filter === 'Ocupados' && badgeText === 'Ocupado') show = true;
            else if (filter === 'En Mantenimiento' && badgeText === 'Mantenimiento') show = true;

            if (show) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Re-apply search
        if (searchInput.value) searchInput.dispatchEvent(new Event('input'));
    });

    // --- DELETE (Example) ---
    const deleteButtons = document.querySelectorAll('.button.is-danger');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Eliminar recurso?')) {
                btn.closest('.resource-card').remove();
            }
        });
    });

});
