(() => {
  "use strict";

  let recipes = [];
  let flatIngredients = [];
  const selectedIngredients = new Set();

  const searchInput = document.getElementById("ingredient-search");
  const clearSelectedBtn = document.getElementById("clear-selected");
  const ingredientListEl = document.getElementById("ingredient-list");
  const resultsCardsEl = document.getElementById("results-cards");
  const resultsChipsEl = document.getElementById("results-chips");

  const modalOverlay = document.getElementById("modal-overlay");
  const modalClose = document.getElementById("modal-close");
  const modalPhoto = document.getElementById("modal-photo");
  const modalTitle = document.getElementById("modal-title");
  const modalIngredients = document.getElementById("modal-ingredients");

  function photoPath(id) {
    return `photos/${id}.jpg`;
  }

  // Fade the ingredient list's scrollbar in while actively scrolling and
  // back out shortly after it stops (same look on mobile and desktop).
  let scrollHideTimer = null;
  ingredientListEl.addEventListener(
    "scroll",
    () => {
      ingredientListEl.classList.add("scrolling");
      clearTimeout(scrollHideTimer);
      scrollHideTimer = setTimeout(() => {
        ingredientListEl.classList.remove("scrolling");
      }, 800);
    },
    { passive: true }
  );

  function deriveFlatIngredients(recipeList) {
    const set = new Set();
    for (const recipe of recipeList) {
      for (const ingredient of recipe.ingredients) {
        set.add(ingredient);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  function getMatches() {
    if (selectedIngredients.size === 0) return [];
    return recipes.filter((recipe) =>
      Array.from(selectedIngredients).every((ing) => recipe.ingredients.includes(ing))
    );
  }

  function renderIngredientList() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? flatIngredients.filter((ing) => ing.toLowerCase().includes(query))
      : flatIngredients;

    ingredientListEl.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "ingredient-empty";
      empty.textContent = "Nav atbilstošu sastāvdaļu.";
      ingredientListEl.appendChild(empty);
      return;
    }

    for (const ingredient of filtered) {
      const li = document.createElement("li");
      li.className = "ingredient-item";
      if (selectedIngredients.has(ingredient)) li.classList.add("selected");
      li.textContent = ingredient;
      li.addEventListener("click", () => {
        if (selectedIngredients.has(ingredient)) {
          selectedIngredients.delete(ingredient);
        } else {
          selectedIngredients.add(ingredient);
        }
        renderIngredientList();
        renderResults();
      });
      ingredientListEl.appendChild(li);
    }
  }

  function renderResults() {
    const matches = getMatches();
    // Desktop cards: browse all recipes until a selection narrows them.
    // Mobile chips: stay empty until a selection is made (unchanged).
    const cardList = selectedIngredients.size === 0 ? recipes : matches;
    const chipList = matches;

    resultsCardsEl.innerHTML = "";
    resultsChipsEl.innerHTML = "";

    if (cardList.length === 0) {
      const cardEmpty = document.createElement("p");
      cardEmpty.className = "results-empty";
      cardEmpty.textContent = "Neviena recepte neatbilst šīm sastāvdaļām.";
      resultsCardsEl.appendChild(cardEmpty);
    } else {
      for (const recipe of cardList) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "recipe-card";
        card.innerHTML = `
          <img class="recipe-card-photo" src="${photoPath(recipe.id)}" alt="" loading="lazy" />
          <div class="recipe-card-body">
            <p class="recipe-card-name">${escapeHtml(recipe.name)}</p>
            <p class="recipe-card-count">${ingredientCountLabel(recipe.ingredients.length)}</p>
          </div>
        `;
        card.addEventListener("click", () => openModal(recipe));
        resultsCardsEl.appendChild(card);
      }
    }

    if (chipList.length === 0) {
      const emptyMsg =
        selectedIngredients.size === 0
          ? "izvēlies sastāvdaļas, lai redzētu receptes"
          : "Neviena recepte neatbilst šīm sastāvdaļām.";

      const chipEmpty = document.createElement("p");
      chipEmpty.className = "results-empty";
      chipEmpty.textContent = emptyMsg;
      resultsChipsEl.appendChild(chipEmpty);
    } else {
      for (const recipe of chipList) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "result-chip";
        chip.textContent = recipe.name;
        chip.addEventListener("click", () => openModal(recipe));
        resultsChipsEl.appendChild(chip);
      }
    }
  }

  // Latvian: singular after numbers ending in 1 (but not 11), plural otherwise.
  function ingredientCountLabel(n) {
    const singular = n % 10 === 1 && n % 100 !== 11;
    return `${n} ${singular ? "sastāvdaļa" : "sastāvdaļas"}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function openModal(recipe) {
    modalPhoto.src = photoPath(recipe.id);
    modalPhoto.alt = recipe.name;
    modalTitle.textContent = recipe.name;
    modalIngredients.innerHTML = "";
    for (const ingredient of recipe.ingredients) {
      const li = document.createElement("li");
      li.textContent = ingredient;
      modalIngredients.appendChild(li);
    }
    modalOverlay.hidden = false;
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  modalClose.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  // Swipe-down-to-close on touch devices.
  const modalEl = modalOverlay.querySelector(".modal");
  let touchStartY = null;

  modalEl.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0].clientY;
      modalEl.style.transition = "none";
    },
    { passive: true }
  );

  modalEl.addEventListener(
    "touchmove",
    (event) => {
      if (touchStartY === null) return;
      const deltaY = event.touches[0].clientY - touchStartY;
      if (deltaY > 0) {
        modalEl.style.transform = `translateY(${deltaY}px)`;
      }
    },
    { passive: true }
  );

  modalEl.addEventListener("touchend", (event) => {
    if (touchStartY === null) return;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    modalEl.style.transition = "";
    modalEl.style.transform = "";
    touchStartY = null;
    if (deltaY > 100) closeModal();
  });

  searchInput.addEventListener("input", renderIngredientList);

  clearSelectedBtn.addEventListener("click", () => {
    selectedIngredients.clear();
    renderIngredientList();
    renderResults();
  });

  // Track the actual visible viewport (accounts for the iOS on-screen
  // keyboard) instead of relying on 100vh, which does not shrink for it.
  function updateAppHeight() {
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-vh", `${height}px`);
  }

  updateAppHeight();
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateAppHeight);
    window.visualViewport.addEventListener("scroll", updateAppHeight);
  } else {
    window.addEventListener("resize", updateAppHeight);
  }

  fetch("recipes.json")
    .then((res) => res.json())
    .then((data) => {
      recipes = data;
      flatIngredients = deriveFlatIngredients(recipes);
      renderIngredientList();
      renderResults();
    })
    .catch((err) => {
      ingredientListEl.innerHTML = `<li class="ingredient-empty">Nevarēja ielādēt recipes.json</li>`;
      console.error(err);
    });
})();
