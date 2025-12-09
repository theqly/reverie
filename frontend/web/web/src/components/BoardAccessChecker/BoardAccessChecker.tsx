// components/BoardAccessChecker.tsx
import React, { useEffect, useState } from "react";
import type { Board, FullBoard } from "../../types/board";
import { fetchBoardBasic, fetchFullBoard, checkUserInGroup } from "../../api/board";

type Props = {
  boardId: string;
  currentUserId: string;
};

export const BoardAccessChecker: React.FC<Props> = ({ boardId, currentUserId}) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullBoard, setFullBoard] = useState<FullBoard | null>(null);
  const [loadingPins, setLoadingPins] = useState(false);
  const [errorPins, setErrorPins] = useState<string | null>(null);

  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingGroup, setCheckingGroup] = useState(false);

  // ------------------------
  // Первый запрос: получить доску для проверки доступа
  // ------------------------
  useEffect(() => {
    async function initBoard() {
      setLoading(true);
      const data = await fetchBoardBasic(boardId);
      if (!data) {
        setError("Нет доступа к этой доске или ошибка запроса");
      }
      setBoard(data);
      setLoading(false);
    }
    initBoard();
  }, [boardId]);

  // ------------------------
  // Проверка доступа
  // ------------------------
  useEffect(() => {
    

    async function checkAccess() {
      if (!board) return;
      const accessType = board.accessLevel.type;

      // public+group_public и private
      if (accessType === "public" || accessType === "group_public") {
        setHasAccess(true);
        return;
      } else if (accessType === "private" && board.owner.id === currentUserId) {
        setHasAccess(true);
        return;
      }

      // group
      if (accessType === "group") {
        setCheckingGroup(true);
        const isInGroup = await checkUserInGroup(currentUserId, board.groupId);
        setHasAccess(isInGroup);
        setCheckingGroup(false);
      }
    }

    checkAccess();
  }, [board]);

  // ------------------------
  // Второй запрос: получить полную доску с пинами
  // ------------------------
  useEffect(() => {
    if (!hasAccess) return;

    async function loadFullBoard() {
      setLoadingPins(true);
      const data = await fetchFullBoard(boardId);
      if (!data) {
        setErrorPins("Ошибка загрузки полной доски");
      }
      setFullBoard(data);
      setLoadingPins(false);
    }

    loadFullBoard();
  }, [boardId, hasAccess]);

  // ------------------------
  // Рендеринг
  // ------------------------
  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!board) return <p>Нет доступа к этой доске</p>;

  if (checkingGroup) return <p>Проверка доступа к группе...</p>;
  if (!hasAccess) return <p>У вас нет доступа к этой подборке</p>;

  if (loadingPins) return <p>Загрузка пинов...</p>;
  if (errorPins) return <p>Ошибка пинов: {errorPins}</p>;
  if (!fullBoard) return <p>Нет данных доски</p>;

  return (
    <div>
      <p>Успех!</p>
      <p>ID доски: {fullBoard.id}</p>
      <p>Название: {fullBoard.name}</p>
      <p>Доступ: {fullBoard.accessLevel.type}</p>
      <p>Владелец: {fullBoard.owner.id}</p>
      <p>Группа: {fullBoard.groupId}</p>
      <p>Создано: {fullBoard.createdAt}</p>

      <h4>Пины:</h4>
      {fullBoard.pins.map(pin => (
        <div key={pin.id}>
          <p>{pin.title}</p>
          <p>{pin.content}</p>
        </div>
      ))}
    </div>
  );
};
