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
    const handleEditCollection = () => {
      // Пока заглушка - всегда авторизован
      navigate('/collection/edit');
      
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

      const handleLogin = () => {
      // Пока заглушка - всегда авторизован
      navigate('/login');
      
      // Позже добавишь проверку:
      // if (isAuthenticated) {
      //   navigate('/collection/create');
      // } else {
      //   showAuthModal();
      // }
    };

     const handleEditPin = () => {
    // Пока заглушка - всегда авторизован
    navigate('/pin/edit');
    
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

  
  const handleViewPin = () => {
    // Пока заглушка - всегда авторизован
    navigate('/pin/view');
    
    // Позже добавишь проверку:
    // if (isAuthenticated) {
    //   navigate('/collection/create');
    // } else {
    //   showAuthModal();
    // }
  };

    const handleViewCollection = () => {
    // Пока заглушка - всегда авторизован
    navigate('/collection/view');
    
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
      <button onClick={handleEditCollection}>
        Редактировать подборку
      </button>
      <button onClick={handleCreatePin}>
        Создать пин
      </button>
      <button onClick={handleEditPin}>
        Редактировать пин
      </button>
      <button onClick={handleProfile}>
        Профиль
      </button>
      <button onClick={handleLogin}>
        Логин
      </button>
      <button onClick={handleViewPin}>
        Посмотреть пин
      </button>
      <button onClick={handleViewCollection}>
        Посмотреть подборку
      </button>
    </div>
  );
};

export default HomePage;