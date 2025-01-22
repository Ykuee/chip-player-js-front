import React, { memo } from "react";

export default memo(VolumeSlider);
function VolumeSlider(props) {
  return <div className="VolumeSlider">
    <input type='range'
           title={"音量"}
           min={0} max={150} step={1}
           onChange={props.onChange}
           onDoubleClick={props.handleReset}
           onContextMenu={props.handleReset}
           value={props.value}>
    </input>
    <div className="VolumeSlider-labels">
      <div>音量</div>
      <div>{props.value}%</div>
    </div>
  </div>;
}
