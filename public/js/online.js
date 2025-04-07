export function getOnlineUsersCount() {
    const socket = io();
    const onlineText = document.querySelector('.online__text');
    // // Слушаем обновления количества онлайн-пользователей
    socket.on('updateOnlineCount', (count) => {
      onlineText.textContent = count;
    });
  }