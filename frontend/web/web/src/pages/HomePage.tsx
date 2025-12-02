import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateCollection = () => {
    // Пока заглушка - всегда авторизован
    navigate('/collection/create');
    
    // Позже добавишь проверку:
    // if (isAuthenticated) {
    //   navigate('/collection/create');
    // } else {
    //   showAuthModal();
    // }
  };

   const handleCreatePin = () => {
    // Пока заглушка - всегда авторизован
    navigate('/pin/create');
    
    // Позже добавишь проверку:
    // if (isAuthenticated) {
    //   navigate('/collection/create');
    // } else {
    //   showAuthModal();
    // }
  };

     const handleProfile = () => {
    // Пока заглушка - всегда авторизован
    navigate('/profile');
    
    // Позже добавишь проверку:
    // if (isAuthenticated) {
    //   navigate('/collection/create');
    // } else {
    //   showAuthModal();
    // }
  };

  return (
    <div className="home-page">
      <button onClick={handleCreateCollection}>
        Создать подборку
      </button>
      <button onClick={handleCreatePin}>
        Создать пин
      </button>
      <button onClick={handleProfile}>
        Профиль
      </button>
    </div>
  );
};

export default HomePage;