import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Container } from "react-bootstrap";
import io from "socket.io-client";
import { useCookies } from "react-cookie";
import Playercolumn from "./PlayerColumns/Playercolumn";
import Centercolumn from "../components/CenterColumn/Centercolumn";
import LoginSplashPage from "./LoginSplashPage";
import UserNamePanel from "./UserNamePanel/UserNamePanel";
import { GameStateContext } from "../context/context";

import "./components.css";

let socket;
const CONNECTION_PORT = "localhost:8000";

// const socket = io.connect("http://localhost8000");

function App() {
  const [cookies, setCookie, removeCookie] = useCookies();
  const [userName, setUserName] = useState("");

  const [gamestate, setGameState] = useContext(GameStateContext);

  const [chatboxmessages, updateChat] = useState([]);

  const log = (text, username = "unknown", timeout) => {
    const newmessage = username + " : " + text;
    updateChat((prevState) => {
      return [...prevState, newmessage];
    });
    if (timeout) {
      setTimeout(() => {
        updateChat((prevState) => {
          return prevState.pop();
        });
      }, timeout);
    }
  };

  // use Effect runs on every render, if second param [] is included, only runs when the item in second param changes.
  useEffect(() => {
    socket = io(CONNECTION_PORT);
    socket.on("message", (text, username = "Server", timeout = false) =>
      log(text, username, timeout)
    );

    socket.on("updatedStateFromServer", (gameState) => {
      setGameState(gameState);
    });

    socket.on("clearChat", () => {
      updateChat([]);
    });

    socket.on("resetSeat", () => {
      setCookie("Seat", 9);
    });

    if (!cookies.Seat) {
      setCookie("Seat", 9);
    }

    socket.emit("getInitialSeating");
  }, [CONNECTION_PORT]);

  const updateSeat = (updatedSeating) => {
    socket.emit("sendLatestSeatingToServer", updatedSeating);
  };

  const resetGame = (playername) => {
    socket.emit("Reset", playername);
  };

  const bid = () => {
    socket.emit("bid", cookies.Seat);
  };

  const chatSubmit = (chatText) => {
    socket.emit("newChat", cookies.Name, chatText);
  };

  const tellServer = (serverMessageString, additionalparam) => {
    socket.emit(`${serverMessageString}`, additionalparam);
  };

  return (
    <Container fluid className="App">
      <Row fluid className="parentRow">
        {cookies.Name ? (
          <Col fluid className="parentCol">
            <UserNamePanel
              cookies={cookies}
              removeCookie={removeCookie}
              resetGame={resetGame}
              tellServer={tellServer}
            ></UserNamePanel>

            <Row fluid className="mainContentRow">
              <Playercolumn
                seatblock={0}
                updateSeat={updateSeat}
                cookies={cookies}
                setCookie={setCookie}
                tellServer={tellServer}
              />
              <Centercolumn
                tellServer={tellServer}
                chatboxmessages={chatboxmessages}
                updateChat={updateChat}
                chatSubmit={chatSubmit}
                bid={bid}
              />
              <Playercolumn
                seatblock={4}
                updateSeat={updateSeat}
                cookies={cookies}
                setCookie={setCookie}
                tellServer={tellServer}
              />
            </Row>
          </Col>
        ) : (
          <LoginSplashPage
            cookieobj={cookies}
            setCookie={setCookie}
            userName={userName}
            setUserName={setUserName}
          />
        )}
      </Row>
    </Container>
  );
}

export default App;
