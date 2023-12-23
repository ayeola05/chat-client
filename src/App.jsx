import { io } from "socket.io-client";
import "./App.css";
import { useState } from "react";
import { useEffect } from "react";

const socket = io("https://chat-server-5f10.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [typing, setIsTyping] = useState("");

  useEffect(() => {
    console.log("Use effect called");
    socket.emit("findAllMessages", {}, (response) => {
      setMessages(response);
    });
  }, []);

  socket.on("message", (message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    // setMessages((prevState) => [...prevState, message]);
  });

  const nameOnChangeHandler = (e) => {
    setName(e.target.value);
  };

  const join = (e) => {
    e.preventDefault();
    if (name.trim().length === 0) return;
    if (!name) return;
    socket.emit("join", { name: name }, () => {
      setJoined(true);
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("createMessage", { text: messageText }, () => {});
  };

  let timeout;

  const emitTyping = (e) => {
    setMessageText(e.target.value);

    socket.emit("typing", { isTyping: true });
    setIsTyping("is typing...");
    timeout = setTimeout(() => {
      socket.emit("typing", { isTyping: false }), 2000;
      setIsTyping("");
    });
  };

  const clearChat = () => {
    socket.emit("removeMessage", {}, () => {});
    setMessages([]);
  };

  return (
    <>
      <div className="layout">
        {!joined ? (
          <div className="card">
            <header>Chat App</header>
            <form onSubmit={join}>
              <label htmlFor="name">Whats your name: </label>
              <input
                onChange={nameOnChangeHandler}
                type="text"
                id="name"
                placeholder="name"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : (
          <div className="">
            <div className="chat">
              {messages.map((message) => {
                return (
                  <li key={Math.random()}>
                    [{message.name}]: {message.text}
                  </li>
                );
              })}
            </div>
            <div>{typing && `${name} is typing...`}</div>
            {/* <hr /> */}
            <div className="message">
              <form onSubmit={sendMessage}>
                <label htmlFor="message">Message </label>
                <input
                  onChange={emitTyping}
                  type="text"
                  id="message"
                  placeholder="message"
                />
                <button type="submit">Send</button>
                <button onClick={clearChat}>Clear Chat</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
