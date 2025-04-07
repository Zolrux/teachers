"use strict";

window.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem("info")) {
        window.location.href = '/';
        return;
    }

    const mode = new URLSearchParams(window.location.search).get("mode");

    if (!mode || !["classic", "mountain"].includes(mode)) {
        window.location.href = "/";
        return;
    }

    const dataInfo = JSON.parse(localStorage.getItem("info"));
    const pageResultList = document.querySelector(".page-result__list");

    switch (mode) {
        case "classic": {
            const teacherWinner = dataInfo.winner.teacher;
            const winnerFullname = `${teacherWinner.surname} ${teacherWinner.name} ${teacherWinner.patronymic}`;
            
            pageResultList.innerHTML = `
            <li class="page-result__item">
                <span>1</span>
                <div class="page-result__img">
                <img src="images/teachers/${teacherWinner.imagePath}" alt="${winnerFullname}">
                </div>
                ${winnerFullname}
            </li>`;

            const scoreboardSortedArr = dataInfo.loosersArr.sort((a, b) => b.selectedCount - a.selectedCount);
            
            scoreboardSortedArr.forEach((looser, index) => {
            const teacherLooser = looser.teacher;
            const looserFullname = `${teacherLooser.surname} ${teacherLooser.name} ${teacherLooser.patronymic}`;

            pageResultList.innerHTML += `
            <li class="page-result__item">
                <span>${index + 2}</span>
                <div class="page-result__img">
                    <img src="images/teachers/${teacherLooser.imagePath}" alt="${looserFullname}">
                </div>
                ${looserFullname}
            </li>`;
            });

            break;
        }

        case "mountain": {

            const teacherWinner = dataInfo.winner.teacher;
            const winnerFullname = `${teacherWinner.surname} ${teacherWinner.name} ${teacherWinner.patronymic}`;

            pageResultList.innerHTML += `
            <li class="page-result__item">
                <span>1</span>
                <div class="page-result__img">
                    <img src="images/teachers/${dataInfo.winner.teacher.imagePath}" alt="${winnerFullname}">
                </div>
                ${winnerFullname}
            </li>`;

            const scoreboardSortedArr = dataInfo.loosersArr.sort((a, b) => b.selectedCount - a.selectedCount);

            scoreboardSortedArr.forEach(({teacher}, index, arr) => {

                const teacherFullname = `${teacher.surname} ${teacher.name} ${teacher.patronymic}`;

                pageResultList.innerHTML += `
                <li class="page-result__item">
                    <span>${index + 2 <= 4 ? index + 2 : `5 - ${arr.length + 1}`}</span>
                    <div class="page-result__img">
                        <img src="images/teachers/${teacher.imagePath}" alt="${teacher.fullname}">
                    </div>
                    ${teacherFullname}
                </li>`;
            })

            break;
        }
    }

});