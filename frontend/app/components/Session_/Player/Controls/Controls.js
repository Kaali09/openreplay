import cn from 'classnames';
import { connect } from 'react-redux';
import { 
  connectPlayer,
  STORAGE_TYPES,
  selectStorageType,
  selectStorageListNow,
} from 'Player/store';

import { Popup, Icon } from 'UI';
import {
  fullscreenOn,
  fullscreenOff,
  toggleBottomBlock,
  CONSOLE,
  NETWORK,
  STACKEVENTS,
  STORAGE,
  PROFILER,
  PERFORMANCE,
  GRAPHQL,
  FETCH,
  EXCEPTIONS,
  LONGTASKS,
} from 'Duck/components/player';
import { ReduxTime } from './Time';
import Timeline from './Timeline';
import ControlButton from './ControlButton';

import styles from './controls.css';


function getStorageIconName(type) {
  switch(type) {
    case STORAGE_TYPES.REDUX:
      return "vendors/redux";
    case STORAGE_TYPES.MOBX:
      return "vendors/mobx"
    case STORAGE_TYPES.VUEX:
      return "vendors/vuex";
    case STORAGE_TYPES.NGRX:
      return "vendors/ngrx";
    case STORAGE_TYPES.NONE:
      return "store"
  }
}

function getStorageName(type) {
  switch(type) {
    case STORAGE_TYPES.REDUX:
      return "Redux";
    case STORAGE_TYPES.MOBX:
      return "MobX";
    case STORAGE_TYPES.VUEX:
      return "Vuex";
    case STORAGE_TYPES.NGRX:
      return "NgRx";
    case STORAGE_TYPES.NONE:
      return "State";
  }
}

@connectPlayer(state => ({
  time: state.time,
  endTime: state.endTime,
  live: state.live,
  livePlay: state.livePlay,
  playing: state.playing,
  completed: state.completed,
  skip: state.skip,
  speed: state.speed,
  disabled: state.cssLoading || state.messagesLoading,
  fullscreenDisabled: state.messagesLoading,
  logCount: state.logListNow.length,
  logRedCount: state.logRedCountNow,
  // resourceCount: state.resourceCountNow,
  resourceRedCount: state.resourceRedCountNow,
  fetchRedCount: state.fetchRedCountNow,
  showStack: state.stackList.length > 0,
  stackCount: state.stackListNow.length,
  stackRedCount: state.stackRedCountNow,
  profilesCount: state.profilesListNow.length,
  storageCount: selectStorageListNow(state).length,
  storageType: selectStorageType(state),
  showStorage: selectStorageType(state) !== STORAGE_TYPES.NONE,
  showProfiler: state.profilesList.length > 0,
  showGraphql: state.graphqlList.length > 0,
  showFetch: state.fetchCount > 0,
  fetchCount: state.fetchCountNow,
  graphqlCount: state.graphqlListNow.length,
  exceptionsCount: state.exceptionsListNow.length,
  showExceptions: state.exceptionsList.length > 0,
  showLongtasks: state.longtasksList.length > 0,
}))
@connect((state, props) => ({
  showDevTools: state.getIn([ 'user', 'account', 'appearance', 'sessionsDevtools' ]),
  fullscreen: state.getIn([ 'components', 'player', 'fullscreen' ]),
  bottomBlock: state.getIn([ 'components', 'player', 'bottomBlock' ]),
  showStorage: props.showStorage || !state.getIn(['components', 'player', 'hiddenHints', 'storage']),
  showStack: props.showStack || !state.getIn(['components', 'player', 'hiddenHints', 'stack']),
}), {
  fullscreenOn,
  fullscreenOff,
  toggleBottomBlock,
})
export default class Controls extends React.Component {

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    //this.props.toggleInspectorMode(false);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.showDevTools !== this.props.showDevTools ||
      nextProps.fullscreen !== this.props.fullscreen ||
      nextProps.bottomBlock !== this.props.bottomBlock ||
      nextProps.endTime !== this.props.endTime ||
      nextProps.live !== this.props.live ||
      nextProps.livePlay !== this.props.livePlay ||
      nextProps.playing !== this.props.playing ||
      nextProps.completed !== this.props.completed || 
      nextProps.skip !== this.props.skip || 
      nextProps.speed !== this.props.speed ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.fullscreenDisabled !== this.props.fullscreenDisabled ||
      //nextProps.inspectorMode !== this.props.inspectorMode ||
      nextProps.logCount !== this.props.logCount ||
      nextProps.logRedCount !== this.props.logRedCount ||
      nextProps.resourceRedCount !== this.props.resourceRedCount ||
      nextProps.fetchRedCount !== this.props.fetchRedCount ||
      nextProps.showStack !== this.props.showStack ||
      nextProps.stackCount !== this.props.stackCount ||
      nextProps.stackRedCount !== this.props.stackRedCount ||
      nextProps.profilesCount !== this.props.profilesCount ||
      nextProps.storageCount !== this.props.storageCount ||
      nextProps.storageType !== this.props.storageType ||
      nextProps.showStorage !== this.props.showStorage ||
      nextProps.showProfiler !== this.props.showProfiler || 
      nextProps.showGraphql !== this.props.showGraphql ||
      nextProps.showFetch !== this.props.showFetch ||
      nextProps.fetchCount !== this.props.fetchCount ||
      nextProps.graphqlCount !== this.props.graphqlCount ||
      nextProps.showExceptions !== this.props.showExceptions ||
      nextProps.exceptionsCount !== this.props.exceptionsCount ||
      nextProps.showLongtasks !== this.props.showLongtasks
    ) return true;
    return false;
  }

  onKeyDown = (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    //if (this.props.inspectorMode) return;
    if (e.key === ' ') {
      document.activeElement.blur();
      this.props.togglePlay();
    }
    if (e.key === 'Esc' || e.key === 'Escape') {
      this.props.fullscreenOff();
    }
    if (e.key === "ArrowRight") {
      this.forthTenSeconds();
    }
    if (e.key === "ArrowLeft") {
      this.backTenSeconds();
    }
    if (e.key === "ArrowDown") {
      this.props.speedDown();
    }
    if (e.key === "ArrowUp") {
      this.props.speedUp();
    }
  }

  // toggleInspectorMode = () => {
  //   this.props.pause();
  //   this.props.toggleInspectorMode();
  // }

  forthTenSeconds = () => {
    const { time, endTime, jump } = this.props;
    jump(Math.min(endTime, time + 1e4))
  }

  backTenSeconds = () => {  //shouldComponentUpdate
    const { time, jump } = this.props;
    jump(Math.max(0, time - 1e4));
  }

  goLive =() => this.props.jump(this.props.endTime)

  renderPlayBtn = () => {
    const { completed, playing, disabled } = this.props;
    let label;
    let icon;
    if (completed) {
      label = 'Replay';
      icon = 'redo';
    } else if (playing) {
      label = 'Pause';
      icon = 'pause';
    } else {
      label = 'Play';
      icon = 'play';
    }
    return (
      <ControlButton
        disabled={ disabled }
        onClick={ this.props.togglePlay }
        icon={ icon }
        label={ label }
      />
    );
  }

  render() {
    const {
      showDevTools,
      bottomBlock,
      toggleBottomBlock,
      live,
      livePlay,
      skip,
      speed,
      disabled,
      fullscreenDisabled,
      logCount,
      logRedCount,
      resourceRedCount,
      fetchRedCount,
      showStack,
      stackCount,
      stackRedCount,
      profilesCount,
      storageCount,
      showStorage,
      storageType,
      showProfiler,
      showGraphql,
      showFetch,
      fetchCount,
      graphqlCount,
      showLongtasks,
      exceptionsCount,
      showExceptions,
      fullscreen,
    } = this.props;

    return (
      <div className={ styles.controls }>
        <Timeline jump={ this.props.jump } />
        { !fullscreen &&
          <div className={ styles.buttons } data-is-live={ live }>
            { !live ?
              <div className={ styles.buttonsLeft }>
                { this.renderPlayBtn() }
                <ControlButton
                  onClick={ this.backTenSeconds }
                  disabled={ disabled }
                  label="Back"
                  icon="replay-10"
                />
              </div>
              :
              <div className={ styles.buttonsLeft }>
                <button onClick={ this.goLive } className={ styles.liveTag } data-is-live={ livePlay }>
                  <Icon name="circle" size="8" marginRight="5" color="white" />
                  <div>{'Live'}</div>
                </button>
                {'Elapsed'}
                <ReduxTime name="time" />
              </div>
            }
            <div className={ styles.butonsRight }>
              {!live &&
                <React.Fragment>
                  <button
                    className={ styles.speedButton }
                    onClick={ this.props.toggleSpeed }
                    data-disabled={ disabled }
                  >
                    <div>{ speed + 'x' }</div>
                  </button>
                  <div className={ styles.divider } /> 
                  <button
                    className={ cn(styles.skipIntervalButton, { [styles.withCheckIcon]: skip }) }
                    onClick={ this.props.toggleSkip }
                    data-disabled={ disabled }
                  >
                    <span className={ styles.checkIcon } />
                    { 'Skip Inactivity' }
                  </button>
                </React.Fragment>
              }
              <div className={ styles.divider } />
              { !live && showDevTools &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(NETWORK) }
                  active={ bottomBlock === NETWORK }
                  label="Network"
                  // count={ redResourceCount }
                  hasErrors={ resourceRedCount > 0 }
                  icon="wifi"
                />
              }
              { showFetch &&
                <ControlButton
                  disabled={disabled}
                  onClick={ ()=> toggleBottomBlock(FETCH) }
                  active={ bottomBlock === FETCH }
                  hasErrors={ fetchRedCount > 0 }
                  count={ fetchCount }
                  label="Fetch"
                  icon="fetch"
                />
              }
              { showGraphql &&
                <ControlButton
                  disabled={disabled}
                  onClick={ ()=> toggleBottomBlock(GRAPHQL) }
                  active={ bottomBlock === GRAPHQL }
                  count={ graphqlCount }
                  label="GraphQL"
                  icon="vendors/graphql"
                />
              }
              { showStorage && showDevTools &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(STORAGE) }
                  active={ bottomBlock === STORAGE }
                  count={ storageCount }
                  label={ getStorageName(storageType) }
                  icon={ getStorageIconName(storageType) }
                />
              }
              { showDevTools &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(CONSOLE) }
                  active={ bottomBlock === CONSOLE }
                  label="Console"
                  icon="console"
                  count={ logCount }
                  hasErrors={ logRedCount > 0 }
                />
              }
              { showExceptions && showDevTools &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(EXCEPTIONS) }
                  active={ bottomBlock === EXCEPTIONS }
                  label="Exceptions"
                  icon="console/error"
                  count={ exceptionsCount }
                  hasErrors={ exceptionsCount > 0 }
                />
              }
              { !live && showDevTools && showStack &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(STACKEVENTS) }
                  active={ bottomBlock === STACKEVENTS }
                  label="Events"
                  icon="puzzle-piece"
                  count={ stackCount }
                  hasErrors={ stackRedCount > 0 }
                />
              }
              { showProfiler && showDevTools &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(PROFILER) }
                  active={ bottomBlock === PROFILER }
                  count={ profilesCount }
                  label="Profiler"
                  icon="code"
                />
              }
              <ControlButton
                disabled={ disabled }
                onClick={ () => toggleBottomBlock(PERFORMANCE) }
                active={ bottomBlock === PERFORMANCE }
                label="Performance"
                icon="tachometer-slow"
              />
              { showLongtasks &&
                <ControlButton
                  disabled={ disabled }
                  onClick={ () => toggleBottomBlock(LONGTASKS) }
                  active={ bottomBlock === LONGTASKS }
                  label="Long Tasks"
                  icon="business-time"
                />
              }
              <div className={ styles.divider } /> 
              { !live && 
                <React.Fragment>
                  <ControlButton
                    disabled={ fullscreenDisabled }
                    onClick={ this.props.fullscreenOn }
                    label="Full Screen"
                    icon="fullscreen"
                  />
                </React.Fragment>
              }
              {/*            
              <ControlButton
                disabled={ disabled && !inspectorMode }
                onClick={ this.toggleInspectorMode }
                icon={ inspectorMode ? 'close' : 'inspect' }
                label="Inspect"
              /> */}
            </div>
          </div>
        }
      </div>
    );
  }
}