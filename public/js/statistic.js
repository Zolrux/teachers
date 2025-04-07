"use strict";

import {MAIN_URL} from "./url.js";
import { storeStatistic } from "./store.js";

window.addEventListener("DOMContentLoaded", () => {
  const modalLoader = document.querySelector(".modal-loader--fixed");
  let loadCount = 10;
  let showMode = "classic"; // default
  let index = 0;

  const fetchData = async (mode = "classicMode") => {
    const res = await fetch(
      `${MAIN_URL}/api/statistics?mode=${mode}` // defualt classic mode
    ); 

    if (res.ok) {
      const json = await res.json();
      return json;
    }
  };

  (async () => {
    modalLoader.classList.add("loading");
    storeStatistic.classicArr = await fetchData();
    modalLoader.classList.remove("loading");

    const arrClassicMode = storeStatistic.classicArr.slice(0, loadCount);
    document.querySelector(".page-statistic__list").innerHTML = "";
    renderList("classic", arrClassicMode);
  })();

  const tabBtns = document.querySelectorAll(".page-statistic__btn");
  const loadMoreBtn = document.querySelector(".page-statistic__load-more");

  function renderList(mode = "classic", arr) {
    const statisticList = document.querySelector(".page-statistic__list");

    modalLoader.classList.add("loading");

    if (mode === "classic") {
      for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        const fullname = `${obj.teacher.surname} ${obj.teacher.name} ${obj.teacher.patronymic}`;

        statisticList.innerHTML += `
                <li class="page-statistic__item">
                    <span>${index + 1}</span>
                    <div class="page-statistic__img">
                        <img src="images/teachers/${
                          obj.teacher.imagePath
                        }" alt="${fullname}">
                    </div>
                    <span>${fullname}</span>
                    <span>Перемог: ${obj.classicMode.wins}</span>
                </li>`;

        index++;
      }

      if (
        loadCount % storeStatistic.classicArr.length === 0 ||
        loadCount > storeStatistic.classicArr.length
      ) {
        loadMoreBtn.style.display = "none";
      }
    } else if (mode === "mountain") {
      for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        const fullname = `${obj.teacher.surname} ${obj.teacher.name} ${obj.teacher.patronymic}`;

        statisticList.innerHTML += `
                <li class="page-statistic__item">
                    <span>${index + 1}</span>
                    <div class="page-statistic__img">
                        <img src="images/teachers/${
                          obj.teacher.imagePath
                        }" alt="${fullname}">
                    </div>
                    <span>${fullname}</span>
                    <span>Перемог: ${obj.mountainMode.wins}</span>
                </li>`;

        index++;
      }

      if (
        loadCount % storeStatistic.mountainArr.length === 0 ||
        loadCount > storeStatistic.mountainArr.length
      ) {
        loadMoreBtn.style.display = "none";
      }
    }

    modalLoader.classList.remove("loading");
  }

  tabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener("click", async () => {
      showMode = tabBtn.dataset.mode;

      tabBtns.forEach((btn) => btn.classList.remove("active"));
      loadMoreBtn.style.display = "block";
      tabBtn.classList.add("active");
      index = 0;
      loadCount = 10;

      if (showMode === "classic") {

        modalLoader.classList.add("loading");
        storeStatistic.classicArr = await fetchData();
        modalLoader.classList.remove("loading");

        const arrClassicMode = storeStatistic.classicArr.slice(0, loadCount);
        document.querySelector(".page-statistic__list").innerHTML = "";
        renderList("classic", arrClassicMode);
      } else {

        modalLoader.classList.add("loading");
        storeStatistic.mountainArr = await fetchData("mountainMode");
        modalLoader.classList.remove("loading");

        const arrMountainMode = storeStatistic.mountainArr.slice(0, loadCount);
        document.querySelector(".page-statistic__list").innerHTML = "";
        renderList("mountain", arrMountainMode);
      }
    });
  });

  loadMoreBtn.addEventListener("click", () => {
    if (showMode === "classic") {
      let arr = [];

      if (storeStatistic.classicArr - loadCount < 10) {
        arr = storeStatistic.classicArr.slice(loadCount);
      } else {
        arr = storeStatistic.classicArr.slice(loadCount, loadCount + 10);
        loadCount += 10;
      }

      renderList("classic", arr);
    } else if (showMode === "mountain") {
      let arr = [];

      if (storeStatistic.mountainArr - loadCount < 10) {
        arr = storeStatistic.classicArr.slice(loadCount);
      } else {
        arr = storeStatistic.mountainArr.slice(loadCount, loadCount + 10);
        loadCount += 10;
      }

      renderList("mountain", arr);
    }
  });
});
