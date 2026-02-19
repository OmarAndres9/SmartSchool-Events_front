document.addEventListener('DOMContentLoaded', () => {

    // --- SEARCH ---
    const searchInput = document.querySelector('.toolbar input[type="text"]');
    const userCards = document.querySelectorAll('.user-card');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        userCards.forEach(card => {
            const name = card.querySelector('.user-name').textContent.toLowerCase();
            const role = card.querySelector('.user-role').textContent.toLowerCase();

            if (name.includes(searchTerm) || role.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // --- FILTER BY ROLE ---
    const roleSelect = document.querySelector('.toolbar select');

    // Helper to get raw role from tag text
    const getRoleFromCard = (card) => {
        const tag = card.querySelector('.tag');
        if (tag.classList.contains('tag-student')) return 'estudiante';
        if (tag.classList.contains('tag-teacher')) return 'docente';
        if (tag.classList.contains('tag-admin')) return 'acudiente'; // Using admin tag for acudiente/admin
        return 'todos';
    };

    roleSelect.addEventListener('change', (e) => {
        const selectedRole = e.target.value;

        userCards.forEach(card => {
            const cardRole = getRoleFromCard(card);

            if (selectedRole === 'todos' || cardRole === selectedRole) {
                if (card.style.display !== 'none') { // Respect search if visible? 
                    // Simple implementation: Reset search visibility if filter changes? 
                    // Or just check if it matches filter. Let's do matches filter.
                    card.style.display = 'block';
                }
            } else {
                card.style.display = 'none';
            }
        });

        // Re-apply search if text exists
        if (searchInput.value) {
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    // --- DELETE ACTION ---
    const deleteButtons = document.querySelectorAll('.action-btn[title="Eliminar"]');

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                const card = btn.closest('.user-card');
                card.style.opacity = '0';
                setTimeout(() => {
                    card.remove();
                }, 300);
            }
        });
    });

});
