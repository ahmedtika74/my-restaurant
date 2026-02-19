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
const cartModal = document.querySelector(".cart-modal");
const closeCart = document.querySelector(".cart-modal .close");
const cartCountHead = document.querySelector(".cart-modal .head .cart-count");
const cartBody = document.querySelector(".cart-modal .body");
const cartTotal = document.querySelector(".cart-modal .footer p");
const checkOutCart = document.querySelector(
  ".cart-modal .action-btn .checkout",
);
const resetCart = document.querySelector(".cart-modal .action-btn .reset");

// Variables for Hero Background
let count = 0;
const heroImagesSrc = [
  "hero-img2.jpg",
  "hero-img3.jpg",
  "hero-img4.jpg",
  "hero-img5.jpg",
  "hero-img1.jpg",
];

// Variables for Meals Cards
let allMeals = [];
const categories = ["Breakfast", "Chicken", "Beef", "Seafood", "Dessert"];
let currentCategory = "All";

// Variables for Cart
let cart = [];

// Show Menu Function
function showMenu() {
  if (window.innerWidth < 768) {
    Overlay.classList.toggle("hidden");
    navUl.classList.toggle("translate-x-full");
  }
}

// Close anything when click on overlay
function closeEverything() {
  Overlay.classList.add("hidden");
  navUl.classList.add("translate-x-full");
  cartModal.classList.add("scale-0", "opacity-0");
  cartModal.classList.remove("scale-100", "opacity-100");
}

// Get Meals Function
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
    drawData(allMeals);
  } catch (error) {
    mealsContainer.style.gridTemplateColumns = "1fr";
    mealsContainer.innerHTML = `<p class="text-3xl mt-8 text-center text-gray-600 font-black">Can't load the menu!</p>`;
  }
}

// Draw Meals Cards Function
function drawData(allMeals) {
  let mealsHtml = "";
  allMeals.forEach((meal) => {
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
}

// Search Meals Function
function search() {
  let filteredData;
  if (currentCategory === "All") {
    filteredData = allMeals.filter((e) =>
      e.strMeal.toLowerCase().includes(searchMeals.value.toLowerCase().trim()),
    );
  } else {
    filteredData = allMeals.filter((e) => e.categoryName === currentCategory);
  }

  filteredData = filteredData.filter((e) =>
    e.strMeal.toLowerCase().includes(searchMeals.value.toLowerCase().trim()),
  );
  if (filteredData.length > 0) {
    mealsContainer.style.gridTemplateColumns = "";
    drawData(filteredData);
  } else {
    mealsContainer.style.gridTemplateColumns = "1fr";
    mealsContainer.innerHTML = `<p class="text-3xl mt-8 text-center text-gray-600 font-black">Can't Found The Meal!</p>`;
  }
}

function displayCart() {
  cartBody.innerHTML = "";
  let cartHtml = "";
  let totalPrice = 0;
  cartCountHead.innerHTML = ` ${cart.length} `;
  if (cart.length) {
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
    cartBody.innerHTML = `<p class="text-red-700 text-2xl font-bold">Your Cart Is Empty!</p>`;
    cartTotal.innerHTML = `0$`;
  }
}

// Start get meals
getMeals();

// Events on Header
MenuBtn.addEventListener("click", showMenu);

Overlay.addEventListener("click", closeEverything);

navLis.forEach((li) => {
  li.addEventListener("click", showMenu);
});

navSearch.addEventListener("click", () => {
  mealsSection.scrollIntoView({ behavior: "smooth" });
});

// Hero Background Change
setInterval(() => {
  heroImage.style.opacity = 0;
  setTimeout(() => {
    count = (count + 1) % heroImagesSrc.length;
    heroImage.src = `./image/${heroImagesSrc[count]}`;
    heroImage.style.opacity = 1;
  }, 500);
}, 3000);

// Event On Search Input
searchMeals.addEventListener("input", search);

// Event on Filter Buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((btn) => btn.classList.remove("active-filter"));
    btn.classList.add("active-filter");
    currentCategory = btn.id;
    searchMeals.value = "";
    search();
  });
});

// Event on Add To Cart Btn
mealsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".add-to-cart-btn")) {
    cart.push(e.target.closest(".add-to-cart-btn").closest(".meal-card").id);
    cartItems.innerHTML = cart.length;
    localStorage.setItem("userCart", JSON.stringify(cart));
  }
});

// Event on Cart Btn
cartBtn.addEventListener("click", () => {
  Overlay.classList.remove("hidden");
  cartModal.classList.replace("scale-0", "scale-100");
  cartModal.classList.replace("opacity-0", "opacity-100");
  displayCart();
});

// Event To Close Modal
closeCart.addEventListener("click", closeEverything);

// Event To Remove Meal From Cart
cartModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-meal")) {
    let value = e.target.closest(".cart-card").id;
    let deletedIndex = cart.indexOf(value);
    if (deletedIndex > -1) {
      cart.splice(deletedIndex, 1);
    }
    localStorage.setItem("userCart", JSON.stringify(cart));
    cartItems.innerHTML = cart.length;
    cartCountHead.innerHTML = ` ${cart.length} `;
    displayCart();
  }
});

// Event To Reset Cart
resetCart.addEventListener("click", () => {
  cart = [];
  localStorage.removeItem("userCart");
  displayCart();
});

onload = () => {
  cart = JSON.parse(localStorage.getItem("userCart")) || [];
  cartItems.innerHTML = cart.length;
};
