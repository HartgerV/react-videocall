import React, { Component } from 'react';
import PropTypes from 'proptypes';
import classnames from 'classnames';
import _ from 'lodash';

class CallWindow extends Component {
  constructor(props) {
    super(props);
    this.addActiveClass= this.addActiveClass.bind(this);
    this.state = {
      Video: true,
      active: false,
      Audio: true
    };
    this.record = function() {
      if(this.recording) {
        let recorder = this.recorder;
        recorder.stopRecording(function () {
          let blob = recorder.getBlob();
          invokeSaveAsDialog(blob);
        });
        this.recording = false
      }
      else {
        this.recorder = RecordRTC(this.peerVideo.srcObject, {
          type: 'video'
        });
        this.recorder.startRecording();
        this.recording = true
      }
    };

    this.btns = [
      { type: 'Video', icon: 'fa-video-camera' },
      { type: 'Audio', icon: 'fa-microphone' }
    ];
  }

  componentDidMount() {
    this.setMediaStream();
  }

  componentWillReceiveProps(nextProps) {
    const { config: currentConfig } = this.props;
    // Initialize when the call started
    if (!currentConfig && nextProps.config) {
      const { config, mediaDevice } = nextProps;
      _.forEach(config, (conf, type) => mediaDevice.toggle(_.capitalize(type), conf));

      this.setState({
        Video: config.video,
        Audio: config.audio
      });
    }
  }

  componentDidUpdate() {
    this.setMediaStream();
  }

  setMediaStream() {
    const { peerSrc, localSrc } = this.props;
    if (this.peerVideo && peerSrc) this.peerVideo.srcObject = peerSrc;
    if (this.localVideo && localSrc) this.localVideo.srcObject = localSrc;
  }

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  toggleMediaDevice(deviceType) {
    const { mediaDevice } = this.props;
    const deviceState = _.get(this.state, deviceType);
    this.setState({ [deviceType]: !deviceState });
    mediaDevice.toggle(deviceType);
  }



  renderControlButtons() {
    const getClass = (icon, type) => classnames(`btn-action fa ${icon}`, {
      disable: !_.get(this.state, type)
    });

    return this.btns.map(btn => (
      <button
        key={`btn${btn.type}`}
        type="button"
        className={getClass(btn.icon, btn.type)}
        onClick={() => this.toggleMediaDevice(btn.type)}
      />
    ));
  }

  render() {
    const { status, endCall } = this.props;
    return (
      <div className={classnames('call-window', status)}>
        <video id="peerVideo" ref={el => this.peerVideo = el} autoPlay />
        <video id="localVideo" className={this.state.active && 'active'}
    onClick={ () => this.setState({active: !this.state.active}) } ref={el => this.localVideo = el} autoPlay muted />
        <div className="video-control">
          {this.renderControlButtons()}
          <button
            type="button"
            className="btn-action hangup fa fa-phone"
            onClick={() => endCall(true)}
          />
          <button
            type="button"
            className={ this.recording ? 'btn-action hangup fa fa-video-camera' : 'btn-action hangup fa fa-phone hidden' }
            onClick={() => this.record()}
          />
        </div>
      </div>
    );
  }
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.object, // eslint-disable-line
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;
