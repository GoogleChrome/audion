import {AudioGraphTextCacheGroup} from './AudioGraphTextCacheGroup';
import {AudioNodeBackgroundRenderCacheGroup} from './AudioNodeBackgroundRenderCacheGroup';
import {AudioPortCacheGroup} from './AudioPortCacheGroup';

export class GraphicsCache {
  textCacheGroup: AudioGraphTextCacheGroup = new AudioGraphTextCacheGroup();
  backgroundCacheGroup: AudioNodeBackgroundRenderCacheGroup =
    new AudioNodeBackgroundRenderCacheGroup({
      textCacheGroup: this.textCacheGroup,
    });
  portCacheGroup: AudioPortCacheGroup = new AudioPortCacheGroup();
}
