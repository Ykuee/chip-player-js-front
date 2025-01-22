import React, { memo, useCallback, useContext } from "react";
import FavoriteButton from "./FavoriteButton";
import { UserContext } from "./UserProvider";

export default memo(Favorites);
function Favorites(props) {
  const {
    currContext,
    currIdx,
    onSongClick,
    handleShufflePlay,
  } = props;

  const {
    user,
    loadingUser,
    faves,
    favesContext,
    handleLogin,
  } = useContext(UserContext);

  const handleShufflePlayFavorites = useCallback(() => {
    handleShufflePlay('favorites');
  }, [handleShufflePlay]);

  // Scroll Into View
  // ----------------
  // const playingRowRef = useRef(null);
  //
  // useEffect(() => {
  //   if (playingRowRef.current) {
  //     playingRowRef.current.scrollIntoViewIfNeeded();
  //   }
  // });

  return (
    loadingUser ?
      <p>Loading user data...</p>
      :
      <div>
        <h3 className="Browse-topRow">
          收藏曲目 ({faves.length})
          {faves.length > 1 &&
            <button
              className="box-button"
              title={`Shuffle all ${faves.length} favorites`}
              onClick={handleShufflePlayFavorites}>
              随机播放
            </button>}
        </h3>
        {user ?
          faves.length > 0 ?
            <div>
              {
                faves.map((fave, i) => {
                  const { href, mtime } = fave;
                  const date = new Date(mtime * 1000).toISOString().split('T')[0];
                  const name = decodeURIComponent(href.split('/').pop());
                  const isPlaying = currContext === favesContext && currIdx === i;
                  return (
                    <div className={isPlaying ? 'Song-now-playing BrowseList-row' : 'BrowseList-row'}
                      // Scroll Into View
                      // ref={isPlaying ? playingRowRef : null}
                         key={i}>
                      <div className="BrowseList-colName">
                        <FavoriteButton href={href}/>
                        <a onClick={onSongClick(href, favesContext, i)} href={href}>{name}</a>
                      </div>
                      <div className="BrowseList-colMtime">
                        {date}
                      </div>
                    </div>
                  );
                })
              }
            </div>
            :
            <div>你没有任何收藏<br/>
              点击 &#003; 爱心标志来收藏曲目
            </div>
          :
          <span>
              你必须 <a href="#" onClick={handleLogin}>
              登录/注册</a>后才能收藏曲目
            </span>
        }
      </div>
  );
}
