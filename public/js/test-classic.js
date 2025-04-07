"use strict";

import {MAIN_URL} from "./url.js";
import { storeClassic } from "./store.js";
import { getOnlineUsersCount } from "./online.js";

window.addEventListener("DOMContentLoaded", () => {

  (async () => {

    const count = parseInt(new URLSearchParams(window.location.search).get("count"));
    const mode = new URLSearchParams(window.location.search).get("mode");

    if (!count || ![16,32,64,128,256,512].includes(count) || mode.toLowerCase() !== "classic") {
      window.location.href = "/";
      return;
    }

    const res = await fetch(`${MAIN_URL}/api/teachers?count=${count}`, {
      headers: {
        "Content-type": "application/json"
      }
    })
    
    storeClassic.teachersArr = await res.json();

    init();
  })();

  function init() {
    const fullnameLeft = document.querySelector(".fullname__left");
    const fullnameRight = document.querySelector(".fullname__right");
    const stageText = document.querySelector(".header-page__stage span");
    const shaffleBtn = document.querySelector(".controls-header__btn");
    const roundText = document.querySelector(".header-page__round");
    const roundNumber = roundText && roundText.querySelector("span[data-round]");
    const maxRound = roundText && roundText.querySelector("span[data-max-round]");
    const modalStage = document.querySelector(".modal-stage");
    const modalStageBody = modalStage && modalStage.querySelector(".modal-stage__body");
    const modalText = modalStageBody && modalStageBody.querySelector(".modal-stage__text");
    const modalTextSpan = modalText && modalText.querySelector(".modal-stage__text span");

    if (localStorage.getItem("info")) {
      localStorage.clear();
    }

    storeClassic.maxRound = storeClassic.teachersArr.length / 2;
    storeClassic.teachersArrIds = [...storeClassic.teachersArr].map((obj) => obj._id);
    storeClassic.teachersArr = storeClassic.teachersArr.map(obj => ({ teacher: obj, selectedCount: 0 }));

    const FINAL_ROUND = 1;
    const SEMI_FINAL_ROUND = 2;
    const QUARTER_FINAL_ROUND = 4;
    const variantsId = {
      first: null,
      second: null
    }

    let isShaffleBtnClicked = false;

    maxRound.textContent = storeClassic.maxRound;

    function handleClickVariant(e, variantFirstId, variantSecondId) {
      const winnerEl = e.target.closest(".variants__column");
      const dataWinnerSideValue = winnerEl.dataset.side;
      const looserValue = dataWinnerSideValue === "right" ? "left" : "right";
      const looserEl = document.querySelector(`[data-side="${looserValue}"]`);
      const fullnameWinner = document.querySelector(
        `[data-fullname-side="${dataWinnerSideValue}"]`
      );
      const winnerId = winnerEl.dataset.teacherId;
      const looserId = looserEl.dataset.teacherId;
      const winnerObj = storeClassic.teachersArr.find((obj) => obj.teacher._id === winnerId);
      const looserObj = storeClassic.teachersArr.find((obj) => obj.teacher._id === looserId);

      winnerEl && winnerEl.classList.add("winner");
      looserEl && looserEl.classList.add("looser");
      fullnameWinner && fullnameWinner.classList.add("winner");

      winnerObj.selectedCount += 1;

      if (storeClassic.maxRound === FINAL_ROUND) {

        const loosersArr = [...storeClassic.loosersArr, looserObj];

        localStorage.setItem(
          "info",
          JSON.stringify({
            winner: winnerObj,
            loosersArr: loosersArr,
          })
        );

        const sendWinnerInfo = async () => {

          const modalLoader = document.querySelector('.modal-loader--fixed');
          
          modalLoader.classList.add("loading");

          const res = await fetch(`${MAIN_URL}/api/win`, {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              winner: winnerObj,
              loosersArr: loosersArr,
              mode: "classic"
            })
          })

          if (res.ok) {
            modalLoader.classList.remove("loading");
            setTimeout(() => (window.location.href = "/results?mode=classic"), 1000);
          }
        }

        setTimeout(() => (sendWinnerInfo()), 1000);
        return;
      }

      storeClassic.winnersArr.push(winnerObj);
      storeClassic.loosersArr.push(looserObj);

      updateRound();

      storeClassic.teachersArrIds = storeClassic.teachersArrIds.filter((indexValue) => {
        return indexValue !== variantFirstId && indexValue !== variantSecondId;
      });
    }

    function updateRound() {
      const winnerElements = document.querySelectorAll(".winner");
      const looserElements = document.querySelectorAll(".looser");

      setTimeout(() => {
        winnerElements.forEach((winnerEl) => {
          winnerEl.classList.remove("winner");
        });
        looserElements.forEach((looserEl) => {
          looserEl.classList.remove("looser");
        });

        const updatedStage = updateStage();

        if (!updatedStage && storeClassic.maxRound !== FINAL_ROUND) {
          createRound();
        } else {
          isShaffleBtnClicked = false;
          createRound(true);
        }
      }, 1500);
    }

    function updateStage() {
      if (storeClassic.teachersArrIds.length !== 0 || storeClassic.round === storeClassic.maxRound) {
        return;
      }
      storeClassic.maxRound = storeClassic.winnersArr.length / 2;
      storeClassic.stage += 1;
      storeClassic.round = 1;

      if (storeClassic.maxRound === QUARTER_FINAL_ROUND) {
        modalText.textContent = "Чвертьфінал";
      }

      if (storeClassic.maxRound === SEMI_FINAL_ROUND) {
        modalText.textContent = "Півфінал";
      }

      // Позволяем делать перетусовку ТОЛЬКО если не етап ФИНАЛА!
      if (storeClassic.round !== storeClassic.maxRound) {
        storeClassic.teachersArrIds = shaffleRandomArr(storeClassic.winnersArr);
        modalTextSpan.textContent = storeClassic.stage;
      } else {
        storeClassic.teachersArrIds = [...storeClassic.winnersArr].map(
          (winnerObj) => winnerObj.teacher._id
        );
        modalText.parentElement.textContent = "Фінал";
      }

      maxRound.textContent = storeClassic.maxRound;
      stageText.textContent = storeClassic.stage;
      storeClassic.winnersArr = [];

      toggleStageModal();

      return true;
    }

    function createRound(isFirstRoundInStage = false) {
      variantsId.first = storeClassic.teachersArrIds[0];
      variantsId.second = storeClassic.teachersArrIds[1];
      
      if (storeClassic.round === storeClassic.maxRound || 
          storeClassic.maxRound <= QUARTER_FINAL_ROUND) {
        shaffleBtn.click(); // убираем событие клик на кнопке
      }

      if (isFirstRoundInStage && !isShaffleBtnClicked) {
        shaffleBtn.removeAttribute("disabled");

        shaffleBtn.addEventListener("click", () => {

          shaffleBtn.setAttribute("disabled", "");
          
          if (storeClassic.round === storeClassic.maxRound || 
            storeClassic.maxRound <= QUARTER_FINAL_ROUND) {
            return;
          }

          variantsId.second = shaffleTeacherVariantId(variantsId.first, variantsId.second); // Тусуем учителя справа

          renderVariants();
        }, {once: true});

        isShaffleBtnClicked = true;
        createRound();
        return;

      } else {
        renderVariants();
      }

      function renderVariants() {
        const variantFirst = storeClassic.teachersArr.find(
          (obj) => obj.teacher._id ===  variantsId.first
        );
        const variantSecond = storeClassic.teachersArr.find(
          (obj) => obj.teacher._id === variantsId.second
        );
        const variantsParentEl = document.querySelector(".variants");
        const variantFirstFullname = `${variantFirst.teacher.surname} ${variantFirst.teacher.name} ${variantFirst.teacher.patronymic}`;
        const variantSecondFullname = `${variantSecond.teacher.surname} ${variantSecond.teacher.name} ${variantSecond.teacher.patronymic}`;
  
        fullnameLeft.textContent = variantFirstFullname;
        fullnameRight.textContent = variantSecondFullname;
        roundNumber.textContent = storeClassic.round;
  
        variantsParentEl.innerHTML = `
        <div class="variants__column variants__column--left" data-side="left" data-teacher-id="${variantFirst.teacher._id}">
            <div class="variants__bg variants__bg--left">
                <img src="images/teachers/${variantFirst.teacher.imagePath}" alt="${variantFirstFullname}">
            </div>
            <img class="variants__img" src="images/teachers/${variantFirst.teacher.imagePath}" alt="${variantFirstFullname}">
        </div>
        <div class="variants__column variants__column--right" data-side="right" data-teacher-id="${variantSecond.teacher._id}">
            <div class="variants__bg variants__bg--right">
                <img src="images/teachers/${variantSecond.teacher.imagePath}" alt="${variantSecondFullname}">
            </div>
            <img class="variants__img" src="images/teachers/${variantSecond.teacher.imagePath}" alt="${variantSecondFullname}">
        </div>
        `;
  
        const variantLeft = document.querySelector(".variants__column--left");
        const variantRight = document.querySelector(".variants__column--right");
  
        variantLeft.addEventListener("click", (e) => {
          storeClassic.round += 1;
          handleClickVariant(e, variantsId.first, variantsId.second);
        });
        variantRight.addEventListener("click", (e) => {
          storeClassic.round += 1;
          handleClickVariant(e, variantsId.first, variantsId.second);
        });

      }
    }

    function toggleStageModal() {
      const removeHideClassFromModalBody = () => {
        setTimeout(() => modalStageBody.classList.remove("hide"), 1200);
      };

      modalTextSpan.textContent = storeClassic.stage;
      modalStage.classList.add("active");

      setTimeout(() => {
        modalStageBody.classList.add("hide");
        modalStage.classList.remove("active");
        removeHideClassFromModalBody();
      }, 1500);
    }

    function shaffleTeacherVariantId(firstVariantId, oldShuffleVariantId) {
      const MIN = 0;
      const MAX = storeClassic.teachersArrIds.length - 1;
      const randomIndex = Math.floor(Math.random() * (MAX - MIN) + MIN);
      const randomId = storeClassic.teachersArrIds[randomIndex];

      if (randomId === oldShuffleVariantId || randomId === firstVariantId) {
        return shaffleTeacherVariantId();
      } else {
        return randomId;
      }
    }

    function shaffleRandomArr(arr) {
      const array = [...arr].map((obj) => obj.teacher._id);
      for (let i = array.length - 1; i > 0; i--) {
        // Перемешиваем массив с использованием алгоритма Фишера-Йетса
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    toggleStageModal();
    createRound(true);
    getOnlineUsersCount();
  }
});
