//search.js

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const listingCards = document.querySelectorAll(".listing-card");

    if (!searchInput || listingCards.length === 0) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();

        listingCards.forEach((card) => {
            const titleElement = card.querySelector(".listing-title");
            const title = titleElement.textContent.toLowerCase();

            card.parentElement.style.display = title.includes(query) ? "block" : "none";
        });
    });
});
