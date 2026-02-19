// Selectors
const Overlay = document.querySelector(".overlay");
const MenuBtn = document.querySelector("header .tools .menu");
const navUl = document.querySelector("header nav ul");
const navLis = document.querySelectorAll("header nav ul li");
const navSearch = document.querySelector("header .search i");
const cartBtn = document.querySelector("header .cart");
const cartItems = document.querySelector("header .cart span");
const heroImage = document.querySelector(".hero img");
const mealsSection = document.querySelector("#meals");
const searchMeals = document.querySelector("#search");
const filterBtns = document.querySelectorAll(".filter-search button");
const mealsContainer = document.querySelector(".meals-container");
const choosePageContainer = document.querySelector(".choose-page");
const cartModal = document.querySelector(".cart-modal");
const mealModal = document.querySelector(".meal-modal");
const closeProduct = document.querySelector(".meal-modal .close");
const productContainer = document.querySelector(
  ".meal-modal .product-container",
);
const closeCart = document.querySelector(".cart-modal .close");
const cartCountHead = document.querySelector(".cart-modal .head .cart-count");
const cartBody = document.querySelector(".cart-modal .body");
const cartFooter = document.querySelector(".cart-modal .footer");
const cartTotal = document.querySelector(".cart-modal .footer p");
const checkOutCart = document.querySelector(
  ".cart-modal .action-btn .checkout",
);
const resetCart = document.querySelector(".cart-modal .action-btn .reset");

// Variables
let allMeals = [];
let cart = [];
let count = 0;
const heroImagesSrc = [
  "hero-img2.jpg",
  "hero-img3.jpg",
  "hero-img4.jpg",
  "hero-img5.jpg",
  "hero-img1.jpg",
];
const categories = ["Breakfast", "Chicken", "Beef", "Seafood", "Dessert"];
let currentCategory = "All";
let currentPage = 1;
const mealsPerPage = innerWidth < 768 ? 5 : 12;

// Utility Fucntions
function showMenu() {
  if (window.innerWidth < 768) {
    Overlay.classList.toggle("hidden");
    navUl.classList.toggle("translate-x-full");
  }
}
function syncCart() {
  localStorage.setItem("userCart", JSON.stringify(cart));
  cartItems.innerHTML = cart.length;
  cartCountHead.innerHTML = ` ${cart.length} `;
}
function messages(message, icon, color) {
  return `
      <div class="flex flex-col items-center justify-center text-gray-600 space-y-4 py-10 animate-in fade-in zoom-in duration-500">
        <i class="${icon} ${color} text-6xl animate-bounce"></i>    
        <p>${message}</p>
      </div>
    `;
}
function closeEverything() {
  Overlay.classList.add("hidden");
  navUl.classList.add("translate-x-full");
  cartModal.classList.add("scale-0", "opacity-0");
  cartModal.classList.remove("scale-100", "opacity-100");
  mealModal.classList.add("scale-0", "opacity-0");
  mealModal.classList.remove("scale-100", "opacity-100");
}
function pageNumbersDisplay(allMeals) {
  const totalPages = Math.ceil(allMeals / mealsPerPage);
  let pageBtn = `
      <button class="px-3 py-2 rounded-lg border transition-all ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-white"}" ${currentPage === 1 ? "disabled" : `onclick="changePage(${currentPage - 1})"`}>
        <i class="fa-solid fa-chevron-left"></i>
      </button>
  `;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pageBtn += `
      <button class="page-btn ${i === currentPage ? "bg-primary text-white" : ""} hover:bg-primary hover:text-white px-4 py-2 rounded-lg border duration-300" onclick="changePage(${i})">
        ${i}
      </button>`;
    }
  }
  pageBtn += `
      <button class="px-3 py-2 rounded-lg border transition-all ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-white "}" ${currentPage === totalPages ? "disabled" : `onclick="changePage(${currentPage + 1})"`}>
        <i class="fa-solid fa-chevron-right"></i>
      </button>
  `;
  choosePageContainer.innerHTML = pageBtn;
}
function toggleModal(modalName) {
  Overlay.classList.remove("hidden");
  modalName.classList.replace("scale-0", "scale-100");
  modalName.classList.replace("opacity-0", "opacity-100");
}
// Draw & Update Data
async function getMeals() {
  // PlaceHolder
  let placeHolderHtml = "";
  for (let i = 0; i < 8; i++) {
    placeHolderHtml += `
      <div class="rounded-3xl border border-gray-100 bg-white p-4 shadow-md animate-pulse">
        <div class="aspect-square w-full rounded-2xl bg-gray-200 mb-4"></div>
        <div class="h-4 w-3/4 rounded bg-gray-200 mb-2"></div>
        <div class="h-4 w-1/2 rounded bg-gray-200 mb-4"></div>
        <div class="h-10 w-full rounded-xl bg-gray-200"></div>
      </div>
    `;
  }
  mealsContainer.innerHTML = placeHolderHtml;
  // Fetch data
  try {
    const request = categories.map((cat) =>
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`).then(
        (res) =>
          res.json().then((data) => {
            if (data.meals) {
              return data.meals.map((meal) => {
                //Fake Description
                const descriptions = [
                  `Delicious ${meal.strMeal} prepared with fresh ingredients and our special ${meal.categoryName} spices.`,
                  `Experience the authentic taste of ${meal.strMeal}. A perfect choice for a hearty ${meal.categoryName} meal.`,
                  `Our signature ${meal.strMeal}, crafted by top chefs to give you an unforgettable flavor.`,
                ];
                return {
                  ...meal,
                  categoryName: cat,
                  price: ((meal.idMeal % 20) + 10).toFixed(2),
                  description:
                    descriptions[parseInt(meal.idMeal) % descriptions.length],
                  rating: (4 + (parseInt(meal.idMeal) % 10) / 10).toFixed(1),
                };
              });
            }
            return [];
          }),
      ),
    );
    const result = await Promise.all(request);
    allMeals = result.flat();
    DrawMealsCards(allMeals);
  } catch (error) {
    mealsContainer.style.gridTemplateColumns = "1fr";
    mealsContainer.innerHTML = messages(
      "Can't load the menu!",
      "fa-solid fa-triangle-exclamation",
      "text-red-600",
    );
  }
}
function DrawMealsCards(allMeals) {
  mealsContainer.innerHTML = "";

  const start = (currentPage - 1) * mealsPerPage;
  const end = start + mealsPerPage;

  const selectedData = allMeals.slice(start, end);
  let mealsHtml = "";

  selectedData.forEach((meal) => {
    mealsHtml += `
          <div id="${meal.idMeal}" class="meal-card group hover:border-primary/20 overflow-hidden rounded-3xl border border-transparent bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="relative overflow-hidden">
              <img
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
                loading="lazy"
                class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="text-primary absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-1.5 font-black shadow-sm">
                ${meal.price}$
              </div>
              <div class="bg-main-text/80 absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium text-white">
                ${meal.categoryName}
              </div>
            </div>
            <div class="p-5">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-main-text text-lg leading-tight font-black line-clamp-1">
                  ${meal.strMeal}
                </h3>
                <div class="text-secondary flex items-center gap-1 text-sm">
                  <i class="fa-solid fa-star"></i>
                  <span class="text-main-text font-bold">${meal.rating}</span>
                </div>
              </div>
              <p class="text-main-text/60 mb-5 line-clamp-2 text-sm">${meal.description}</p>
              <button class="add-to-cart-btn group/btn bg-primary hover:bg-primary/90 shadow-primary/30 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white shadow-lg transition-all active:scale-95">
                <i class="fa-solid fa-cart-shopping transition-transform group-hover/btn:-rotate-12"></i>
                Add to Cart
              </button>
            </div>
          </div>
      `;
  });
  mealsContainer.innerHTML = mealsHtml;
  pageNumbersDisplay(allMeals.length);
}
function displayCart() {
  syncCart();
  cartBody.innerHTML = "";
  let cartHtml = "";
  let totalPrice = 0;
  if (cart.length) {
    cartFooter.style.display = "block";
    cart.forEach((id) => {
      const newCartCheckout = allMeals.find((e) => e.idMeal === id);
      if (newCartCheckout) {
        totalPrice += parseFloat(newCartCheckout.price);
        cartHtml += `
          <div id="${newCartCheckout.idMeal}" class="cart-card mb-3 flex items-center justify-between rounded-2xl bg-gray-100 p-3">
            <img src="${newCartCheckout.strMealThumb}" alt="${newCartCheckout.strMeal}" class="h-10 w-10 rounded-2xl md:h-20 md:w-20" />
            <div class="data">
              <h3 class="text-base font-bold md:text-xl">${newCartCheckout.strMeal}</h3>
              <span class="text-[14px] md:text-base">${newCartCheckout.price}$</span>
            </div>
            <button class="delete-meal flex h-7 w-7 items-center justify-center bg-red-500 font-black text-white">
              X
            </button>
          </div>
        `;
      }
    });
    cartBody.innerHTML = cartHtml;
    cartTotal.innerHTML = `${totalPrice.toFixed(2)}$`;
  } else {
    cartBody.innerHTML = messages(
      "Your Cart Is Empty!",
      "fa-solid fa-face-frown-open",
      "text-gray-400",
    );
    cartFooter.style.display = "none";
    cartTotal.innerHTML = `0$`;
  }
}
function showProduct(id) {
  let myProduct = allMeals.find((e) => e.idMeal === id);
  productContainer.id = id;
  productContainer.innerHTML = `
          <div class="content p-2 md:mb-5 md:flex">
          <img
            src="${myProduct.strMealThumb}"
            alt="${myProduct.strMeal}"
            class="rounded-2xl shadow-md md:w-[50%]"
          />
          <div class="data flex flex-col justify-between md:px-5">
            <div
              class="top flex items-center justify-between gap-3 pt-5 pb-2 text-2xl font-black"
            >
              <h3>${myProduct.strMeal}</h3>
              <p class="text-primary">${myProduct.price}$</p>
            </div>
            <p class="text-primary/70 font-bold text-justify">
              ${myProduct.description}
            </p>
            <div class="info my-2 flex items-center justify-between">
              <p class="font-bold bg-indigo-100 text-primary p-2 rounded-2xl">${myProduct.categoryName}</p>
              <div class="text-secondary flex items-center gap-1 text-sm">
                <i class="fa-solid fa-star"></i>
                <span class="text-main-text font-bold">${myProduct.rating}</span>
              </div>
            </div>
          </div>
        </div>
        <button
          class="order-now-btn group/btn bg-primary hover:bg-primary/90 shadow-primary/30 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white shadow-lg transition-all active:scale-95"
        >
          <i
            class="fa-solid fa-cart-shopping transition-transform group-hover/btn:-rotate-12"
          ></i
          >Order Now
        </button>
  `;
}

// Features Functions
function search() {
  let searchValue = searchMeals.value.toLowerCase().trim();

  let filteredData = allMeals.filter((meal) => {
    let searchByValue = meal.strMeal.toLowerCase().includes(searchValue);
    let searchCategory =
      currentCategory === "All" || meal.categoryName === currentCategory;
    return searchByValue && searchCategory;
  });

  if (filteredData.length > 0) {
    mealsContainer.style.gridTemplateColumns = "";
    DrawMealsCards(filteredData);
  } else {
    mealsContainer.style.gridTemplateColumns = "1fr";
    mealsContainer.innerHTML = messages(
      "Can't Found The Meal!",
      "fa-solid fa-magnifying-glass-minus",
      "text-gray-400",
    );
    choosePageContainer.innerHTML = "";
  }
}
function filterCategory(btn) {
  filterBtns.forEach((btn) => btn.classList.remove("active-filter"));
  btn.classList.add("active-filter");
  currentCategory = btn.id;
  searchMeals.value = "";
  currentPage = 1;
  search();
}
function removeFromCart(mealId) {
  let deletedIndex = cart.indexOf(mealId);
  if (deletedIndex > -1) {
    cart.splice(deletedIndex, 1);
  }
  displayCart();
}
function checkout() {
  if (cart.length) {
    cartFooter.style.display = "none";
    cartBody.innerHTML = messages(
      "Order Placed Successfully!",
      "fa-solid fa-circle-check",
      "text-green-500",
    );
    reset();
    setTimeout(() => {
      closeEverything();
    }, 3000);
  }
}
function reset() {
  cart = [];
  syncCart();
}
function changePage(page) {
  currentPage = page;
  search();
  mealsSection.scrollIntoView({ behavior: "smooth" });
}

// Hero Image Change
setInterval(() => {
  heroImage.style.opacity = 0;
  setTimeout(() => {
    count = (count + 1) % heroImagesSrc.length;
    heroImage.src = `./image/${heroImagesSrc[count]}`;
    heroImage.style.opacity = 1;
  }, 500);
}, 3000);

// Events on Header
MenuBtn.addEventListener("click", showMenu);
Overlay.addEventListener("click", closeEverything);
navLis.forEach((li) => {
  li.addEventListener("click", () => {
    navLis.forEach((li) =>
      li.classList.remove("active", "md:border-primary", "md:border-b-2"),
    );
    li.classList.add("active", "md:border-primary", "md:border-b-2");
    showMenu();
  });
});
navSearch.addEventListener("click", () => {
  mealsSection.scrollIntoView({ behavior: "smooth" });
});
searchMeals.addEventListener("input", () => {
  currentPage = 1;
  search();
});
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterCategory(btn);
  });
});
mealsContainer.addEventListener("click", (e) => {
  let btn = e.target.closest(".add-to-cart-btn");
  if (btn) {
    cart.push(btn.closest(".meal-card").id);
    syncCart();
  }
  const card = e.target.closest(".meal-card");
  if (card && !btn) {
    toggleModal(mealModal);
    showProduct(card.id);
  }
});
closeProduct.addEventListener("click", closeEverything);
cartBtn.addEventListener("click", () => {
  toggleModal(cartModal);
  displayCart();
});
closeCart.addEventListener("click", closeEverything);
cartModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-meal")) {
    let mealId = e.target.closest(".cart-card").id;
    removeFromCart(mealId);
  }
});
productContainer.addEventListener("click", (e) => {
  let btn = e.target.closest(".order-now-btn");
  if (btn) {
    cart.push(btn.closest(".product-container").id);
    syncCart();
  }
});
checkOutCart.addEventListener("click", checkout);
resetCart.addEventListener("click", () => {
  reset();
  displayCart();
});

getMeals();
onload = () => {
  cart = JSON.parse(localStorage.getItem("userCart")) || [];
  syncCart();
};
