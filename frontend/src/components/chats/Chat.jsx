import React, { useEffect, useRef, useState } from "react";
import chat from "../../pics/chat.png";
import { useSelector } from "react-redux";
import { sendClientMessage } from "../../store/api/chat/sendClientMessage";
import { findUserRequest } from "../../store/api/chat/findUserRequest";
import ManagerChatDialogItem from "./ManagerChatDialogsItem";
import io from "socket.io-client";
import { readMessage } from "../../store/api/chat/readMessage";

const socket = io.connect(process.env.REACT_APP_BACK_URL);

export default function Chat() {
  const { user } = useSelector((state) => state.crUser);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [myMessage, setMyMessage] = useState("");
  const dialog = useRef();
  const [currenChat, setCurrentChat] = useState({ _id: "newchat" }); // текущий чат
  const [messages, setMessages] = useState(null); // массив сообщений

  // ======================================
  useEffect(() => {
    if (isChatVisible) {
      fetchUserReq();
      goToEndDialog();
    }
  }, [isChatVisible]);

  // ======================================
  useEffect(() => {
    fetchUserReq();
  }, []);

  //==== Слушаем сообщение сервера ========
  useEffect(() => {
    if (!isChatVisible) {
      return;
    }
    const eventName = `serverToClient${user._id}`;
    socket.on(eventName, (data) => {
      if (data.clientId === user._id) {
        fetchUserReq(); // Новые сообщения запрашиваем
      }
    });
    goToEndDialog(); // Переход в конец сообщений
    return () => {
      socket.off(eventName);
    };
  }, [messages, isChatVisible]);

  // ======================================
  async function fetchUserReq() {
    const response = await findUserRequest(user._id);
    if (response.length > 0) {
      setCurrentChat(response[0]);
      setMessages(response[0].messages);
    }
  }

  // ======================================
  function goToEndDialog() {
    if (dialog.current && isChatVisible && messages) {
      dialog.current.scrollTop = 99999; // Прокрутка вниз
      if (messages.at(-1).author === user._id) return; // Если последнее message автора то не посылаем в сокет
      // Отправка ПРОЧТЕНО
      const notReadMess = messages
        .filter((i) => i.author !== user._id && !i.readAt)
        .map((i) => i._id);
      if (notReadMess.length < 1) return;

      const params = {
        id: currenChat,
        body: {
          createdBefore: notReadMess,
        },
      };
      const response = readMessage(params); // Посылаем метку ПРОЧИТАНО
      const bodyToSocket = { clientId: user._id };
      socket.emit("clientReadMessage", bodyToSocket);
    }
  }

  // ======================================
  async function fnSendMessage() {
    if (myMessage.trim().length < 1) return;
    const body = { author: user._id, text: myMessage };
    const params = { id: currenChat, body };
    const response = await sendClientMessage(params);
    if (response.errorStatus) {
      return;
    }
    const bodyToSocket = { clientId: user._id };
    socket.emit("clientToManager", bodyToSocket);
    setCurrentChat(response);
    setMyMessage("");
  }

  // ======================================
  return (
    <>
      <img
        className="chat-btn"
        width="80"
        height="80"
        src={chat}
        alt="speech-bubble-with-dots"
        onClick={() => setIsChatVisible(!isChatVisible)}
      />
      {isChatVisible && (
        <div className="chat-window">
          <div className="chat-dialog" ref={dialog}>
            {messages &&
              messages.map((i) => (
                <ManagerChatDialogItem key={i._id} item={i} chatOwner={user} />
              ))}
          </div>
          <div className="chat-send">
            <input
              className="chat-input"
              type="text"
              value={myMessage}
              onChange={(e) => setMyMessage(e.target.value)}
            />
            <button className="chat-send-btn" onClick={fnSendMessage}>
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
