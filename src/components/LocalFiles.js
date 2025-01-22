import React, { memo, useCallback } from "react";
import { FORMATS } from '../config';
import trash from '../images/trash.png';
import bytes from 'bytes';

const formatList = FORMATS.filter(f => f !== 'miniusf').map(f => `.${f}`);
const splitPoint = Math.floor(formatList.length / 2);
const formatsLine1 = formatList.slice(0, splitPoint).join(' ');
const formatsLine2 = formatList.slice(splitPoint).join(' ');

export default memo(LocalFiles);

function LocalFiles(props) {
  const {
    listing,
    currContext,
    playContext,
    currIdx,
    onSongClick,
    onDelete,
    loading,
  } = props;

  const handleDelete = useCallback((event) => {
    const href = event.currentTarget.dataset.href;
    if (event.shiftKey) {
      onDelete(href);
    } else {
      if (window.confirm('Are you sure you want to remove this file from browser storage?\n(Shift-click to remove without confirmation.)'))
        onDelete(href);
    }
  }, [onDelete]);

  return (
    <div>
      <h3 className="Browse-topRow">
        本地文件 ({listing.length})
      </h3>
      {loading ?
        "加载本地文件中..."
        :
        listing.length === 0 ?
          <div>
            <p>
              你还没有添加任何本地文件。
            </p>
            <p>
              这里上传的文件将会保存在本地浏览器中。<br/>
              （请备份一份——浏览器可能会丢失这些数据。）<br/>
              本地文件无法添加到收藏
            </p>
            <p>
              支持的格式有：
            </p>
            <p>
              {formatsLine1}<br/>
              {formatsLine2}<br/>
            </p>
          </div>
          :
          <div>
            {
              listing.map((item, i) => {
                const href = item.path;
                const title = decodeURIComponent(href.split('/').pop());
                const isPlaying = currContext === playContext && currIdx === i;
                return (
                  <div key={title} className={isPlaying ? 'Song-now-playing BrowseList-row' : 'BrowseList-row'}>
                    <button className='Trash-button' onClick={handleDelete} data-href={href}>
                      <img alt='trash' className='inline-icon' src={trash}/>
                    </button>
                    <div className="BrowseList-colName">
                      <a onClick={onSongClick(href, playContext, i)} href={href}  style={{ color: '#616161' }}>{title}</a>
                    </div>
                    <div className="BrowseList-colMtime">
                      {item.mtime}
                    </div>
                    <div className="BrowseList-colSize">
                      {bytes(item.size, { unitSeparator: ' ' })}
                    </div>
                  </div>
                );
              })
            }
          </div>
      }
    </div>
  );
}
