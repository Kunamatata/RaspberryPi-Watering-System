import React from "react";

function Slider(props){
    return (<div><input type="range" min="10" max="1500" onMouseUp={props.handler}/></div>);
}

export default Slider;