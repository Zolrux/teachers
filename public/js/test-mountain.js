"use strict";

import {MAIN_URL} from "./url.js";
import { storeMountain } from "./store.js";
import { getOnlineUsersCount } from "./online.js";

window.addEventListener("DOMContentLoaded", () => {

  (async () => {

    const count = parseInt(new URLSearchParams(window.location.search).get("count"));
    const mode = new URLSearchParams(window.location.search).get("mode");

    if (!count || ![16,32,64,128,256,512].includes(count) || mode.toLowerCase() !== "mountain") {
      window.location.href = "/";
      return;
    }

    const res = await fetch(`${MAIN_URL}/api/teachers?count=${count}`, {
      headers: {
        "Content-type": "application/json"
      }
    })
    
    storeMountain.teachersArr = await res.json();

    init();
  })();

  function init() {
    const fullnameLeft = document.querySelector(".fullname__left");
    const fullnameRight = document.querySelector(".fullname__right");
    const roundText = document.querySelector(".header-page__round");
    const roundNumber = roundText && roundText.querySelector("span[data-round]");
    const maxRound = roundText && roundText.querySelector("span[data-max-round]");
  
    if (localStorage.getItem("info")) {
      localStorage.clear();
    }

    storeMountain.teachersArrIds = [...storeMountain.teachersArr].map((obj) => obj._id);
    storeMountain.teachersArr = storeMountain.teachersArr.map(obj => ({ teacher: obj, selectedCount: 0 }));
  
    storeMountain.maxRound = storeMountain.teachersArr.length - 1;
    maxRound.textContent = storeMountain.maxRound;

    function handleClickVariant(e, variantFirstId, variantSecondId) {
      const winnerEl = e.target.closest(".variants__column");
      const dataWinnerSideValue = winnerEl.dataset.side;
      const looserSideValue = dataWinnerSideValue === "right" ? "left" : "right";
      const looserEl = document.querySelector(`[data-side="${looserSideValue}"]`);
      const fullnameWinner = document.querySelector(
        `[data-fullname-side="${dataWinnerSideValue}"]`
      );
  
      const winnerId = winnerEl.dataset.teacherId;
      const looserId = looserEl.dataset.teacherId;
      const winnerObj = storeMountain.teachersArr.find((obj) => obj.teacher._id === winnerId);
      const looserObj = storeMountain.teachersArr.find((obj) => obj.teacher._id === looserId);
  
      winnerEl && winnerEl.classList.add("winner");
      looserEl && looserEl.classList.add("looser");
      fullnameWinner && fullnameWinner.classList.add("winner");

      storeMountain.loosersArr.push(looserObj);
      storeMountain.currentWinner = winnerObj;
  
      for (const obj of storeMountain.teachersArr) {
          const {teacher} = obj;
        
          if (winnerObj.teacher._id === teacher._id) {
            obj.selectedCount += 1;
            break;
        }
      }
  
      if (storeMountain.round === storeMountain.maxRound) {
        localStorage.setItem(
          "info",
          JSON.stringify({
            winner: storeMountain.currentWinner,
            loosersArr: storeMountain.loosersArr,
          })
        );

        roundNumber.textContent = storeMountain.round;

        const sendWinnerInfo = async () => {

          const modalLoader = document.querySelector('.modal-loader--fixed');
          
          modalLoader.classList.add("loading");

          const res = await fetch(`${MAIN_URL}/api/win`, {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              winner: storeMountain.currentWinner,
              loosersArr: storeMountain.loosersArr,
              mode: "mountain"
            })
          })

          if (res.ok) {
            modalLoader.classList.remove("loading");
            setTimeout(() => (window.location.href = "/results?mode=mountain"), 1000);
          }
        }

        setTimeout(sendWinnerInfo, 1000);
        return;
      }
        
      updateRound(winnerEl);
  
      storeMountain.teachersArrIds = storeMountain.teachersArrIds.filter((indexValue) => {
          if (!storeMountain.teachersArrIds.includes(variantFirstId)) {
              return indexValue !== variantSecondId;
          }
          else if (!storeMountain.teachersArrIds.includes(variantSecondId)) {
              return indexValue !== variantFirstId;
          }
          else {
              return indexValue !== variantFirstId && indexValue !== variantSecondId;
          }
      });

      // handleStepBack(false)();
    }
  
    function updateRound(winnerElement) {
      const winnerElements = document.querySelectorAll(".winner"); // ФИО + изображение
      const looserElements = document.querySelectorAll(".looser");
      const currentWinner = document.querySelector(".variants__column.current-winner");
      
      setTimeout(() => {
          winnerElements.forEach((winnerEl) => {
              winnerEl.classList.remove("winner");
          });
          looserElements.forEach((looserEl) => {
              looserEl.classList.remove("looser");
          });
  
          currentWinner && currentWinner.classList.remove("current-winner");
          winnerElement.classList.add("current-winner");
        
        createRound();
      }, 1500);
    }
  
    function createRound() {
      let variantId, variantFirstId, variantSecondId, 
          variant, variantFirst, variantSecond;
      
      if (!storeMountain.currentWinner) {
          variantFirstId = storeMountain.teachersArrIds[0];
          variantSecondId = storeMountain.teachersArrIds[1];
  
          variantFirst = storeMountain.teachersArr.find(
              (obj) => obj.teacher._id === variantFirstId
          );
          variantSecond = storeMountain.teachersArr.find(
              (obj) => obj.teacher._id === variantSecondId
          );
      }
      else {
          variantId = storeMountain.teachersArrIds[0];
          variant = storeMountain.teachersArr.find(
              (obj) => obj.teacher._id === variantId
          );
      }
  
      const variantsParentEl = document.querySelector(".variants");
      const variantFirstName = storeMountain?.currentWinner?.teacher?.name || variantFirst?.teacher?.name;
      const variantFirstSurname = storeMountain?.currentWinner?.teacher?.surname || variantFirst?.teacher?.surname;
      const variantFirstPatronymic = storeMountain?.currentWinner?.teacher?.patronymic || variantFirst?.teacher?.patronymic;
      const variantSecondName = variant?.teacher?.name || variantSecond?.teacher?.name;
      const variantSecondSurname = variant?.teacher?.surname || variantSecond?.teacher?.surname;
      const variantSecondPatronymic = variant?.teacher?.patronymic || variantSecond?.teacher?.patronymic;
      const variantFirstFullname = `${variantFirstSurname} ${variantFirstName} ${variantFirstPatronymic}`;
      const variantSecondFullname = `${variantSecondSurname} ${variantSecondName} ${variantSecondPatronymic}`;
  
      fullnameLeft.textContent = variantFirstFullname;
      fullnameRight.textContent = variantSecondFullname;
      roundNumber.textContent = storeMountain.round;
  
      if (storeMountain.currentWinner) {
          const currentWinner = document.querySelector(".variants__column.current-winner");
          const currentSideWinner = currentWinner.dataset.side;
          fullnameLeft.setAttribute("data-fullname-side", currentSideWinner);
          fullnameRight.setAttribute("data-fullname-side", currentSideWinner === "left" ? "right" : "left");
      }
  
      if (!storeMountain.currentWinner) {
          
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
            handleClickVariant(e, variantFirstId, variantSecondId);
          }, {once: true});
  
          variantRight.addEventListener("click", (e) => {
            handleClickVariant(e, variantFirstId, variantSecondId);
          }, {once: true});
  
      }
      else {
          const currentWinner = document.querySelector(".variants__column.current-winner");
          const newVariant = document.querySelector('.variants__column:not(.current-winner)');
          const sideVariant = newVariant.dataset.side;
          const createdNewVariant = document.createElement("div");
  
          newVariant.remove();
  
          createdNewVariant.classList.add("variants__column", `variants__column--${sideVariant}`);
          createdNewVariant.setAttribute("data-side", sideVariant);
          createdNewVariant.setAttribute("data-teacher-id", variant.teacher._id);
  
          createdNewVariant.innerHTML = `
          <div class="variants__bg variants__bg--${sideVariant}">
              <img src="images/teachers/${variant.teacher.imagePath}" alt="${variantSecondFullname}">
          </div>
          <img class="variants__img" src="images/teachers/${variant.teacher.imagePath}" alt="${variantSecondFullname}">
          `;
  
          variantsParentEl.append(createdNewVariant);
  
          currentWinner.addEventListener("click", (e) => {
              handleClickVariant(e, storeMountain.currentWinner._id, variantId);
          }, {once: true});
  
          createdNewVariant.addEventListener("click", (e) => {
              handleClickVariant(e, storeMountain.currentWinner._id, variantId);
          }, {once: true});
      }
      
      storeMountain.round += 1;
    }

    // function handleStepBack(hasEventClick) {
    //   return () => {

    //     if (hasEventClick) {
    //       hasEventClick = false;
    //       return;
    //     }

    //     const stepBackBtn = document.querySelector(".controls-header__btn");

    //     const isDisabledAttrBtn = () => {
    //       if (storeMountain.round === 1 || storeMountain.round === storeMountain.maxRound) {
    //         stepBackBtn.disabled = true;
    //         return true;
    //       }
    //       else {
    //         stepBackBtn.disabled = false;
    //         return false;
    //       }
    //     }

    //     isDisabledAttrBtn();

    //     stepBackBtn.addEventListener("click", () => {

    //       hasEventClick = false;

    //       if (isDisabledAttrBtn()) {
    //         return;
    //       }

    //       storeMountain.round -= 1;
    //       console.log(storeMountain.currentWinner)
    //       const currentWinnerObj = storeMountain.teachersArr.find(item => item.teacher._id === storeMountain.currentWinner.teacher._id);
    //       const currentLooserObj = storeMountain.loosersArr.pop();
    //       storeMountain.teachersArrIds.splice(0, 0, currentWinnerObj.teacher._id, currentLooserObj.teacher._id);
    //       storeMountain.currentWinner = null;
    //       currentWinnerObj.wins -= 1;

    //       stepBackBtn.disabled = true;
    //       hasEventClick = false;
    //       createRound();

    //     }, {once: true});
    //   }
    // }
  
    createRound();
    getOnlineUsersCount();
  }
});