import banner from "./../banner.png";

export const About = (props) => {
  return (
    <div id="about" className="text-center">
      <div className="container">
        <div className="row" style={rowStyle}>
          <div
            className="col-xs-12 col-md-6"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2>What are Kitty Kads?</h2>
            <p style={{ marginBottom: 0 }}>
              {props.data ? props.data.paragraph : "loading..."}
              <br />
              {props.data ? props.data.paragraph2 : "loading..."}
              <br />
              You can read their full origin story here
              <br />
              <br />
              {props.data ? props.data.paragraph3 : "loading..."}
            </p>
          </div>
          <div
            className="col-xs-12 col-md-6"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={banner}
              style={imgStyle}
              className="img-responsive"
              alt=""
            />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

const rowStyle = {
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const imgStyle = {
  height: 250,
  marginTop: 0,
  width: "auto",
  marginLeft: "auto",
  marginRight: "auto",
  display: "block",
};
