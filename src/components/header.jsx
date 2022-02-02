import { useEffect, useContext, useState } from "react";
import useWindowSize from "./../hooks/useWindowSize";
import { PactContext, TEST_NET_ID } from "../wallet/pact-wallet";
import shuffleSeed from "shuffle-seed";

import Pact from "pact-lang-api";

const IMAGE_SCALE = 10;
const TOTAL_IMAGES = 33;
const indexes = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
const shuffledIndexes = shuffleSeed.shuffle(indexes, Math.random());

// const shuffledKitties = shuffleSeed.shuffle(kitties, Math.random());

export const Header = (props) => {
  // const [image2dArr, setImage2dArr] = useState([[]]);
  const [imgIndex, setImageIndex] = useState(0);
  const isSmallScreen = useWindowSize() <= 600;
  const screenStyleToAdd = isSmallScreen ? smallScreenStyle : {};
  const screenStyle = { ...style, ...screenStyleToAdd };
  const splitStyleToAddImg = isSmallScreen ? smallImageStyle : {};
  const splitStyleImg = { ...splitContainerStyle, ...splitStyleToAddImg };
  const {
    openConnectWallet,
    sendTransaction,
    useSetNetworkSettings,
    gasPrice,
    account,
    chainId,
    netId,
  } = useContext(PactContext);

  useSetNetworkSettings(TEST_NET_ID, "0");
  useEffect(() => {
    // Preload the images
    shuffledIndexes.forEach((preloadIndex) => {
      const img = new Image();
      img.src = `/img/${shuffledIndexes[preloadIndex]}.png`;
    });
    let index = 0;
    setInterval(function () {
      index = (index + 1) % shuffledIndexes.length;
      setImageIndex(index);
    }, 4000);
  }, [setImageIndex]);

  // const c = document.getElementById("myCanvas");
  // const showCanvas = image2dArr.length > 0 && image2dArr[0].length > 0;

  // useEffect(() => {
  //   if (c != null && showCanvas) {
  //     var ctx = c.getContext("2d");
  //     ctx.clearRect(
  //       0,
  //       0,
  //       image2dArr[0].length * IMAGE_SCALE,
  //       image2dArr.length * IMAGE_SCALE
  //     );
  //     for (var i = 0; i < image2dArr.length; i++) {
  //       for (var j = 0; j < image2dArr[0].length; j++) {
  //         const r = image2dArr[i][j]["r"];
  //         const g = image2dArr[i][j]["g"];
  //         const b = image2dArr[i][j]["b"];
  //         const a = image2dArr[i][j]["a"];
  //         ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", " + a + ")";
  //         ctx.fillRect(
  //           j * IMAGE_SCALE,
  //           i * IMAGE_SCALE,
  //           IMAGE_SCALE,
  //           IMAGE_SCALE
  //         );
  //       }
  //     }
  //     console.log(c.toDataURL());
  //   }
  // }, [image2dArr, c, showCanvas]);
  const splitStyleToAddTxt = isSmallScreen ? smallTextStyle : normalTextStyle;
  const splitStyleText = { ...splitContainerStyle, ...splitStyleToAddTxt };
  // const imageWidth = 38 * IMAGE_SCALE;
  // const imageHeight = 32 * IMAGE_SCALE;
  const imgSrc = `/img/${shuffledIndexes[imgIndex]}.png`;
  return (
    <header id="header">
      <div className="intro" style={screenStyle}>
        <div style={splitStyleImg}>
          <img src={imgSrc} key={imgSrc} style={{ height: 320 }} />
          {/* <canvas
            style={{ all: "initial" }}
            id="myCanvas"
            width={imageWidth}
            height={imageHeight}
          ></canvas> */}
        </div>
        <div style={splitStyleText}>
          <div className="">
            <div className="intro-text">
              <h1>
                {props.data ? props.data.title : "Loading"}
                <span></span>
              </h1>
              <p style={{ marginTop: 25 }}>
                {props.data ? props.data.paragraph1 : "Loading"}
                <br />
                {props.data ? props.data.paragraph2 : "Loading"}
                <br />
                <br />
                Launching soon
              </p>
              <div style={{ marginBottom: 20 }}>
                <a
                  href="#socials"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Follow for updates
                </a>
              </div>
              <div>
                <a href="#about" className="btn btn-custom btn-lg page-scroll">
                  Learn more
                </a>
              </div>
              {/* <div>
                <button
                  className="btn btn-custom btn-lg"
                  onClick={() => onConnectWallet(openConnectWallet)}
                >
                  Connect wallet
                </button>
              </div>
              {account?.account != null && (
                <div>
                  <button
                    className="btn btn-custom btn-lg"
                    onClick={() =>
                      onSendTransaction(
                        sendTransaction,
                        chainId,
                        netId,
                        gasPrice,
                        account
                      )
                    }
                  >
                    Buy a Kitty Kad
                  </button>
                </div> */}
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// async function onSendTransaction(
//   sendTransaction,
//   chainId,
//   netId,
//   gasPrice,
//   account
// ) {
//   const pactCode = `(free.hello-world.hi "test")`;
//   const cmd = {
//     pactCode,
//     caps: [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])],
//     sender: account.account,
//     gasLimit: 3000,
//     gasPrice,
//     chainId,
//     ttl: 600,
//     envData: {
//       "user-ks": account.guard,
//     },
//     signingPubKey: account.guard.keys[0],
//     networkId: netId,
//   };
//   const previewContent = <p>You will buy 1 Kitty Kad for 1 KDA</p>;
//   await sendTransaction(cmd, previewContent, "buying a Kitty Kad", () =>
//     alert("Bought!")
//   );
// }

// async function onConnectWallet(openConnectWallet) {
//   await openConnectWallet();
// }

function getImage2DArray(callback) {
  const url = `http://localhost:4214/getImage`;
  fetchJson(url, callback);
}

function fetchJson(url, callback) {
  const params = {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  fetch(url, params)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callback(json);
    });
}

const backgroundColor = "#58B2EE";
const style = {
  background: backgroundColor,
  display: "flex",
  direction: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  maxWidth: "100%",
  overflow: "auto",
  paddingLeft: "20px",
  paddingRight: "20px",
};

const smallScreenStyle = {
  justifyContent: "center",
  paddingBottom: "30px",
  paddingTop: "30px",
};

const splitContainerStyle = {
  width: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
  paddingTop: "140px",
  paddingBottom: "75px",
};

const normalTextStyle = {
  justifyContent: "flex-start",
};

const smallImageStyle = {
  width: "100%",
  paddingTop: "70px",
  paddingBottom: "0px",
  overflow: "hidden",
};

const smallTextStyle = {
  width: "100%",
  paddingTop: 0,
  paddingBottom: "30px",
};
