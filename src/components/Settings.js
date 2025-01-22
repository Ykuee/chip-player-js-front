import React, { memo } from 'react';
import PlayerParams from './PlayerParams';

export default memo(Settings);
function Settings(props) {
  const {
    ejected,
    tempo,
    currentSongNumVoices,
    voiceMask,
    voiceNames,
    voiceGroups,
    handleSetVoiceMask,
    handleTempoChange,
    sequencer,
  } = props;
  return (
    <div className='Settings'>
      <h3>{sequencer?.getPlayer()?.name || '播放器'} 设置</h3>
      {sequencer?.getPlayer() ?
        <PlayerParams
          ejected={ejected}
          tempo={tempo}
          numVoices={currentSongNumVoices}
          voiceMask={voiceMask}
          voiceNames={voiceNames}
          voiceGroups={voiceGroups}
          handleTempoChange={handleTempoChange}
          handleSetVoiceMask={handleSetVoiceMask}
          getParameter={sequencer.getPlayer().getParameter}
          setParameter={sequencer.getPlayer().setParameter}
          paramDefs={sequencer.getPlayer().getParamDefs()}/>
        :
        <div>(请播放曲目)</div>}
    </div>
  );
}
